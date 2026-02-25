import { ID_DATOS_GENERALES, ID_TORNEOS } from "./constants";
import { parseCSV, getEffectiveTourType } from "./utils";

export const normalizeName = (name: string) => {
    if (!name) return "";
    return name.replace(/^\(\d+\)\s*/, "").trim().toUpperCase();
};

export const isValidPlayer = (name: string) => {
    if (!name) return false;
    const upper = name.toUpperCase();
    if (upper === "BYE" || upper === "-" || upper === "") return false;
    
    // Filtro preciso: ignora si dice exactamente "ZONA ", "ZN " o arranca con "1° Z" / "2° Z"
    if (upper.includes("ZONA ") || upper.includes("ZN ") || upper.match(/^[12]°\s*Z/)) return false;
    return true;
};

export const calculateRankingData = async (
    navState: any,
    bracketData: any
) => {
    const urlBaremo = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Formatos Grupos")}&range=A37:Z50`;
    const res = await fetch(urlBaremo);
    const txt = await res.text();
    const rows = parseCSV(txt);
    
    const catName = navState.category || navState.selectedCategory;
    const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${catName} 2026`)}`;
    const rankRes = await fetch(rankUrl);
    const rankCsv = await rankRes.text();
    const rankNames = parseCSV(rankCsv).slice(1).map((row: any[]) => row[1] ? row[1].trim().toLowerCase() : "");
    
    const getRankIndex = (name: string) => {
        if (!name) return 99999;
        const n = name.toLowerCase().trim();
        let idx = rankNames.indexOf(n);
        if (idx !== -1) return idx;
        const parts = n.replace(/,/g, "").split(" ").filter((p: string) => p.length > 2); 
        if (parts.length > 0) idx = rankNames.findIndex((rankName: string) => rankName.includes(parts[0]));
        return idx === -1 ? 99999 : idx;
    };

    const headerRow = rows[0]; 
    const currentTourShort = navState.tournamentShort ? navState.tournamentShort.trim().toLowerCase() : "";
    const tourType = getEffectiveTourType(navState.tournamentShort, navState.gender);
    
    let colIndex = -1;
    for(let i=0; i<headerRow.length; i++) { if (headerRow[i] && headerRow[i].trim().toLowerCase() === currentTourShort) { colIndex = i; break; } }
    if (colIndex === -1) { for(let i=0; i<headerRow.length; i++) { if (headerRow[i] && headerRow[i].trim().toLowerCase().includes(currentTourShort)) { colIndex = i; break; } } }
    if (colIndex === -1) { throw new Error("Error obteniendo la columna de puntos"); }

    const getPoints = (rowIndex: number) => { if (!rows[rowIndex] || !rows[rowIndex][colIndex]) return 0; const val = parseInt(rows[rowIndex][colIndex]); return isNaN(val) ? 0 : val; };
    
    const pts = { 
        champion: getPoints(1),     // Ganador
        finalist: getPoints(2),     // Finalista
        semi: getPoints(3),         // Semifinalistas
        quarters: getPoints(4),     // Cuartos
        octavos: getPoints(5),      // Octavos
        dieciseis: getPoints(6),    // Dieciseisavos
        treintaidos: getPoints(7),  // 32avos
        groupWin1: getPoints(8),    // 1 partido en el grupo
        groupWin2: getPoints(9)     // 2 partidos en el grupo
    };
    
    const playerScores: any = {};

    const addRoundScore = (name: string, score: number) => {
        if (!isValidPlayer(name)) return;
        const cleanName = normalizeName(name);
        if (!playerScores[cleanName] || score > playerScores[cleanName]) { 
            playerScores[cleanName] = score; 
        }
    };

    // 1. CÁLCULO DE FASE ELIMINATORIA DEPENDIENDO DEL TAMAÑO DEL CUADRO
    if (bracketData.hasData) {
        const { r1, r2, r3, r4, r5, r6, winner, bracketSize } = bracketData;
        let semis: string[] = [], cuartos: string[] = [], octavos: string[] = [], dieciseis: string[] = [], treintaidos: string[] = [];
        let finalists: string[] = [];
        
        if (bracketSize === 64) { semis = r5; cuartos = r4; octavos = r3; dieciseis = r2; treintaidos = r1; finalists = r6 || []; }
        else if (bracketSize === 32) { semis = r4; cuartos = r3; octavos = r2; dieciseis = r1; finalists = r5 || []; } 
        else if (bracketSize === 16) { semis = r3; cuartos = r2; octavos = r1; finalists = r4 || []; } 
        else { semis = r2; cuartos = r1; finalists = r3 || []; }
        
        if (bracketSize === 64) treintaidos.forEach((p: string) => addRoundScore(p, pts.treintaidos));
        if (bracketSize >= 32) dieciseis.forEach((p: string) => addRoundScore(p, pts.dieciseis));
        if (bracketSize >= 16) octavos.forEach((p: string) => addRoundScore(p, pts.octavos));
        cuartos.forEach((p: string) => addRoundScore(p, pts.quarters));
        semis.forEach((p: string) => addRoundScore(p, pts.semi));
        
        const winnerName = normalizeName(winner);
        finalists.forEach((p: string) => { 
            if (isValidPlayer(p)) { 
                const pClean = normalizeName(p); 
                if (winnerName && pClean === winnerName) addRoundScore(pClean, pts.champion); 
                else addRoundScore(pClean, pts.finalist); 
            } 
        });
    }

    // 2. CÁLCULO DE FASE DE GRUPOS (SÓLO SI ES FULL)
    if (tourType === "full") {
        const groupUrl = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`Grupos ${navState.tournamentShort} ${navState.category}`)}`;
        try {
            const groupRes = await fetch(groupUrl);
            const groupTxt = await groupRes.text();
            const groupRows = parseCSV(groupTxt);
            const playerWins: any = {};
            
            for (let i = 0; i < groupRows.length; i += 4) {
                if (groupRows[i] && groupRows[i][0] && (groupRows[i][0].includes("Zona") || groupRows[i][0].includes("Grupo"))) {
                    const players = [groupRows[i+1]?.[0], groupRows[i+2]?.[0], groupRows[i+3]?.[0], groupRows[i+4]?.[0]].filter((p: any) => p && p !== "-" && p !== "");
                    
                    for(let x=0; x<players.length; x++) {
                        const rawName = players[x];
                        if (!isValidPlayer(rawName)) continue;
                        const pName = normalizeName(rawName); 
                        
                        if (!playerWins[pName]) playerWins[pName] = 0; 
                        
                        const rowIndex = i + 1 + x;
                        if (groupRows[rowIndex]) { 
                            for(let y=1; y<=players.length; y++) { 
                                const res = groupRows[rowIndex][y]; 
                                if(res && res.length > 2) { 
                                    const sets = res.trim().split(" "); 
                                    let sW = 0, sL = 0; 
                                    sets.forEach((s: string) => { 
                                        if(s.includes("/")) { 
                                            const parts = s.split("/").map(Number); 
                                            if(parts[0] > parts[1]) sW++; else sL++; 
                                        } 
                                    }); 
                                    if(sW > sL) playerWins[pName]++; 
                                } 
                            } 
                        }
                    }
                }
            }
            
            Object.keys(playerWins).forEach(pName => { 
                const wins = playerWins[pName]; 
                let extraPoints = 0; 
                // Sumamos si ganó, no si jugó
                if (wins === 1) extraPoints = pts.groupWin1; 
                else if (wins >= 2) extraPoints = pts.groupWin2; 
                
                if (playerScores[pName] !== undefined) playerScores[pName] += extraPoints; 
                else playerScores[pName] = extraPoints; 
            });
        } catch (err) { console.log("Error ranking full groups", err); }
    }

    // 3. REGLA DIRECTA INTACTA
    const targetTournaments = ["adelaide", "iw", "mc", "us"];
    const currentTourLower = currentTourShort.toLowerCase();
    const isTargetTournament = targetTournaments.includes(currentTourLower);

    if (tourType === "direct" && bracketData.hasData && isTargetTournament) {
        const { r1, r2, r3 } = bracketData;
        
        for (let i = 0; i < (r1?.length || 0); i += 2) {
            const p1 = r1[i];
            const p2 = r1[i+1];
            
            if (!p1 || !p2) continue;

            const p1Clean = normalizeName(p1);
            const p2Clean = normalizeName(p2);
            const p1IsBye = p1Clean === "BYE";
            const p2IsBye = p2Clean === "BYE";
            const r2Index = Math.floor(i / 2);

            if (!p1IsBye && !p2IsBye) {
                const winnerR1 = r2[r2Index]; 
                if (winnerR1 && winnerR1.trim() !== "") {
                    const wName = normalizeName(winnerR1);
                    if (p1Clean !== wName) delete playerScores[p1Clean];
                    if (p2Clean !== wName) delete playerScores[p2Clean];
                }
            }
            else if (p2IsBye && !p1IsBye) {
                if (r3) {
                    const winnerR2 = r3[Math.floor(r2Index / 2)];
                    if (winnerR2 && winnerR2.trim() !== "") {
                        const wNameR2 = normalizeName(winnerR2);
                        if (p1Clean !== wNameR2) delete playerScores[p1Clean];
                    }
                }
            }
            else if (p1IsBye && !p2IsBye) {
                if (r3) {
                    const winnerR2 = r3[Math.floor(r2Index / 2)];
                    if (winnerR2 && winnerR2.trim() !== "") {
                        const wNameR2 = normalizeName(winnerR2);
                        if (p2Clean !== wNameR2) delete playerScores[p2Clean];
                    }
                }
            }
        }
    }

    const rankingArray = Object.keys(playerScores).map(key => ({ name: key, points: playerScores[key] })).sort((a, b) => { 
        const rankA = getRankIndex(a.name); 
        const rankB = getRankIndex(b.name); 
        if (rankA === rankB) return b.points - a.points; 
        return rankA - rankB; 
    });

    return rankingArray;
};