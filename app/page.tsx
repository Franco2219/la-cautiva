"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, CheckCircle, Loader2, Send, AlertCircle, Shuffle, Calculator, X, Copy } from "lucide-react"

// ==============================================================================
// BASE DE DATOS OFFLINE (CORREGIDA Y CON PUNTOS AGREGADOS)
// ==============================================================================
const OFFLINE_DATA: any = {
  // --- RANKINGS 2025 ---
  "A 2025": `POSICION,NOMBRE,Australian Open,Indian Wells,Monte Carlo,Roland Garros,Wimbledon,Us Open,Masters,TOTAL
1,Palmero Thiago,400,1000,400,400,1300,800,,4300
2,Martin Fernandez,1300,,,2000,,,,3300
3,Cristian Orso,100,,200,200,2000,800,,3300
4,Mauri Di giacomo,,,1000,800,,1300,,3100
5,Juan Cruz Recalde,800,,650,,800,,,2250
6,Di Lullo,2000,,,,,,,2000
7,Maxi Tucci,800,400,100,,400,200,,1900
8,Juampi Doffigny,400,650,100,200,200,200,,1750
9,Juampi Lois,400,,200,800,,200,,1600
10,Benja Gunzelman,,,,1300,,,,1300
11,Luis Cobas,200,,400,200,100,400,,1300
12,Martin Olivera,200,,200,400,100,400,,1300
13,Alan Santamaria,,,,,,100,800,900
14,Tomi Olguin,,,,800,,,100,900
15,Diego Fronza,50,,50,100,100,400,,700
16,Mauri Ramos,200,200,100,100,,,50,650
17,Nico Palmero,,,50,50,200,200,,500
18,Juan carrizo,100,100,50,50,100,100,,500
19,Acosta Lisandro,,,,,400,,,400
20,Diego zelarrayan,,,100,100,200,,,400
21,Leandro Bernal,200,200,,,,,0,400
22,Nico Dicuzzo,,,200,,100,100,,400
23,Pablo De Tina,,,50,100,100,100,,350
24,Ayala Martin,,,,,100,200,,300
25,Melchiori,,,50,,200,,,250
26,"Chade, Lautaro",,,200,50,,,0,250
27,Videla Gabriel,,,100,,100,,,200
28,Schuldt Adolfo,,,50,50,100,,,200
29,Julian Rinaldi,100,,,,100,,,200
30,Alejandro Verio,,,50,50,100,,,200
31,Charly Valenzuela,,,200,,,,,200
32,Ezequiel Ramos,,,,,200,,,200
33,Mariano Juarez,50,,,100,,,,150
34,Jony Alvarez,,,100,,,,,100
35,Mariano Piola,,,,100,,,,100
36,Mauri C,50,,50,,,,,100
37,Ale Antelo,,,50,50,,,,100
38,Migue Otero,,,50,50,,,,100
39,Agus Lening,,,100,,,,,100
40,Seba Suarez,,,50,,50,,,100
41,Mauri Di giacomo Padre,,,100,,,,,100
42,Seba Mendez,,,100,,,,,100
43,Tamburrino,100,,,,,,,100
44,Rojas Lucas,,,100,,,,,100
45,"Souto, Lean",,,,,100,,,100
46,"Fernandez, Tomás ",,,,,100,,,100
47,"Alvarez, M",,,,,,100,,100
48,Cabrera Martin,,,50,,,,,50
49,Barbero D,,,50,,,,,50
50,Gomez Sergio,,,50,,,,,50
51,Gimenez A,,,,50,,,,50
52,Rinaudo Joaquin,,,,50,,,,50
53,Gomez Matu,,,,50,,,,50`,

  "B1 2025": `POSICION,NOMBRE,Australian Open,Indian Wells,Monte Carlo,Rolan Garros,Wimbledon,Us Open,Masters,TOTAL
1,"Castro, Ariel",800,,400,800,1300,2000,400,5700
2,"Capurro, Martin",800,,650,200,200,100,800,2750
3,"Fernandez, Tomi",200,,1000,10,200,800,200,2410
4,Nico Palmero,2000,,,,,,400,2400
5,Rezilo H,100,,,400,1300,,400,2200
6,"Medina, Mati",400,,50,100,200,1300,,2050
7,"Vega, Fer",50,,,400,400,400,800,2050
8,Alvarez Martin,,,,2000,10,,,2010
9,Borelo Fabio,200,,100,1300,100,,0,1700
10,"Melgarejo, Juan M",,650,100,100,200,400,200,1650
11,"Scagliola, Gonza",400,,,,400,800,,1600
12,"De tina, Pablo",200,200,100,200,100,400,200,1400
13,"Chade, L",1300,,,,,,,1300
14,"Romero, A",,100,200,100,800,100,,1300
15,"Guerra, Facu",400,400,50,200,100,100,0,1250
16,"Verio, Ale",100,100,100,100,400,400,0,1200
17,Mariano Juarez,400,,400,200,,,200,1200
18,"Lodico, G",100,100,50,200,200,400,0,1050
19,Sepulveda Pablo,,1000,,,,,1000
20,"Toso, Marcel",50,,50,200,400,200,,900
21,Gil G,,,100,100,200,400,,800
22,Videla Gabriel,100,100,100,100,200,100,,700
23,Petrillo Ale,,,200,50,200,200,,650
24,Gafni Edgardo,100,200,100,100,100,,0,600
25,Rinaudo Joaquin,100,200,100,100,100,,,600
26,Acosta Lisandro,200,,200,100,100,,,600
27,Ale Gimenez,,,,200,400,,,600
28,Gabaldon Seba,,,400,50,100,,,550
29,Curti Rama,,,50,50,200,200,,500
30,Arevalo Ariel,,,200,50,,200,,450
31,Milito Fede,,,50,100,100,200,,450
32,Fede Fernandez,,400,,,,,400
33,Julian Rinaldi,,400,,,,,400
34,Barbero Diego,,,200,100,100,,,400
35,"Rizzo, Edu",100,100,100,100,,,,400
36,Ruhl Alberto,,,100,50,50,100,,300
37,Gianni Fer,,,100,50,50,100,,300
38,"Lerro, Pablo",50,50,50,50,50,50,,300
39,Matu Gomez,,,200,100,,,300
40,Seba Mendez,,,50,200,,,250
41,Juli Buriano,,,50,50,100,,,200
42,Seba Suarez,,,50,50,100,,,200
43,Martin Cabrera,,,100,100,,,200
44,Agus Lening,,,100,,100,,200
45,Sergio Gomez,,,200,,,,200
46,Santi Iacovino,,,,200,,,200
47,Ferro Fran,,,,200,,,200
48,Fer Femenia,200,,,,,,200
49,Mauri C,,,100,50,,,150
50,Valenzuela Charly,100,,,,,50,150
51,Mauri Di giacomo Padre,,,100,50,,,150
52,Migue Otero,,,50,100,,,150
53,Ale Antelo,,,50,100,,,150
54,Daniel Calvo,,,,100,,50,150
55,Fer Cutone,,100,,,,,100
56,Diego Magaldi,,100,,,,,100
57,Leo Heredia,,,50,,50,,100
58,Oliva Fer,,,,,100,,100
59,Vazquez Nahuel,,,,,100,,100
60,Zupancic,,,,,100,,100
61,Ramos Ruben,,,,,100,,100
62,Ramos Ezequiel,,,,,100,,100
63,Tules Matias,,,,,100,,100`,

  "B2 2025": `POSICION,NOMBRE,Australian Open,Indian Wells,Monte Carlo,Roland Garros,Wimbledon,Us Open,Masters,TOTAL
1,"Andria, Emiliano",10,,400,2000,1300,,0,3710
2,"Augusto, Ale",200,,200,1300,,400,1500,3600
3,Rizzo Edu,200,,50,200,800,1300,800,3350
4,"Rezilo, Hernan",400,,650,400,1300,,,2750
5,"Baldino, Augusto",400,,100,,400,1300,400,2600
6,"Gandolfo, Gerarado",10,650,650,400,200,400,200,2510
7,Pose Cris,400,,100,800,400,400,,2100
8,Peroti Ezequiel,100,100,50,800,200,400,400,2050
9,"Melgarejo, J",2000,,,,,,,2000
10,"Lardapide, Facu",800,200,200,200,100,,400,1900
11,"Eiriz, Esteban",200,400,50,200,400,400,200,1850
12,"Perropato, Pablo",800,200,50,100,200,200,200,1750
13,Oliva Fer,400,100,50,200,400,200,200,1550
14,"Barraza, Gerardo",200,100,200,400,200,200,200,1500
15,"Vazquez, Nahuel",400,100,100,200,200,200,200,1400
16,"Ramos, Ruben",200,100,100,200,100,400,200,1300
17,"Zupancic, Cris",100,100,200,100,200,400,200,1300
18,"Tules, Matias",200,100,100,200,200,400,0,1200
19,Juan Macri,,,200,400,200,,200,1000
20,"Ramos, Ezequiel",200,100,100,100,200,200,0,900
21,Daniel Calvo,200,,200,200,200,100,0,900
22,Fede Lois,100,200,100,100,200,200,0,900
23,Lening Agus,100,,50,50,200,400,,800
24,Martin S,100,100,200,100,200,,,700
25,Peralta Gaston,,1000,,,,,,1000
26,"Gatti, Pablo",,,100,100,100,200,,500
27,"Porciuncula, Pablo",,,50,50,200,200,,500
28,Rodriguez H,,400,,,,,,400
29,Molina David,50,100,50,100,100,,,400
30,Verdiani,,,100,50,100,100,,350
31,Lean Souto,,,100,50,200,,,350
32,Suarez Roman,,,100,200,,,,300
33,Pautaso Lean,,100,100,100,,,,300
34,Moulins Seba,,,50,50,200,,,300
35,Sampaolesi,,,,,100,200,,300
36,Ferro Fran,,,100,200,,,,300
37,Javier Q,,,50,100,100,,,250
38,Gaston Dieser,,,100,100,,,,200
39,Gustavo Ponce,,,100,100,,,,200
40,Seba Mendez,,200,,,,,,200
41,Gelabert L,,,,,200,,,200
42,Ger Romanach,,,,,100,100,,200
43,Capuya Ali,,,,,100,100,,200
44,Leo Sandoval,,,50,50,50,,,150
45,Siri,,,,,,100,,100
46,Ferreyra Oscar,,,,,,100,,100
47,Caruso Jorge,,,,,,100,,100
48,Giani F,,,,100,,,,100
49,Valenzuela Charly,,,,100,,,,100
50,Fede Fernandez,,,,100,,,,100
51,Javier Fuseneco,,,,100,,,,100
52,Pablo Sepulveda,,,,100,,,,100
53,Santi Iacovino,,,,100,,,,100
54,Daniel Torrico,,100,,,,,,100
55,Uchima E,,100,,,,,,100
56,Torres German,,,50,50,,,,100
57,Fede Agüero,,,100,,,,,100
58,Catalini,,,,,,,50,50`,

  "C 2025": `POSICION,NOMBRE,Australian Open,Indian Wells,Monte Carlo,Roland Garros,Wimbledon,Us Open,Masters,TOTAL
1,"Ferro, Fran",800,,,200,2000,,200,3200
2,Guardia Jony,,,100,200,100,1300,1300,3000
3,Juan Baleis,50,200,650,800,800,,200,2700
4,"Alonso, Ricky",200,400,200,400,1300,,200,2700
5,Hornos Lean,,,,2000,,,400,2400
6,"Caruso, Jorge",,,50,50,400,800,1000,2300
7,"Ferreyra, Oscar",400,650,100,100,400,400,0,2050
8,Franco Sabatino,2000,,,,,,,2000
9,Meijomil R,800,,200,400,200,,400,2000
10,Tito Rizzo,200,1000,400,200,,,,1800
11,"Pautaso, Lean",200,200,100,100,200,400,,1200
12,Ruben Dimilta,,,100,100,800,200,,1200
13,Claudio Catalini,,,100,100,200,800,,1200
14,"Molina, David",,400,100,100,400,200,,1200
15,"Candia, David",100,100,100,100,400,400,,1200
16,Pena Fausto,400,200,50,100,200,200,,1150
17,Pizzuti Nico,200,100,50,100,200,400,,1050
18,"Topa, Federico",400,200,50,100,200,100,,1050
19,Lopes Rito A,,100,100,100,200,400,,900
20,"Rodriguez, Hector",,200,,650,,,850
21,Siri V,200,100,100,100,200,100,,800
22,Godoy D,,,1000,,,,1000
23,Barreto R,,,,1300,,,,1300
24,Martin Picallo,400,100,200,100,,,800
25,Coloseti M,,,100,100,100,400,,700
26,Colito A,,,,,,400,,400
27,Atadia A,,200,,100,50,,,350
28,Orellana A,100,100,,100,,,300
29,Eberle A,,200,,,,,200
30,Cornejo C,,200,,,,,200
31,Nieto N,,100,,,,,100
32,Pantaneti F,,100,,,,,100
33,Riquelme J,,100,,,,,100
34,Joel,,100,,,,,100`,

  // --- RANKINGS 2026 ---
  "A 2026": `POSICION,NOMBRE,Adelaide,AO,IW,,,,,,,TOTAL
1,Palmero Thiago,,,,,,,,,,0
2,Martin Fernandez,,,,,,,,,,0
3,Cristian Orso,,,,,,,,,,0
4,Mauri Di giacomo,,,,,,,,,,0
5,Juan Cruz Recalde,,,,,,,,,,0
6,Di Lullo,,,,,,,,,,0
7,Maxi Tucci,,,,,,,,,,0
8,Juampi Doffigny,,,,,,,,,,0
9,Juampi Lois,,,,,,,,,,0
10,Benja Gunzelman,,,,,,,,,,0
11,Luis Cobas,,,,,,,,,,0
12,Martin Olivera,,,,,,,,,,0
13,Mariano Juarez,,,,,,,,,,0
14,Santamaria Alan,,,,,,,,,,0
15,Tomi Olguin,,,,,,,,,,0
16,Diego Fronza,,,,,,,,,,0
17,Mauri Ramos,,,,,,,,,,0
18,Nico Palmero,,,,,,,,,,0
19,Juan carrizo,,,,,,,,,,0
20,Acosta Lisandro,,,,,,,,,,0
21,Diego zelarrayan,,,,,,,,,,0
22,Leandro Bernal,,,,,,,,,,0
23,Nico Dicuzzo,,,,,,,,,,0
24,Pablo De Tina,,,,,,,,,,0
25,Ayala Martin,,,,,,,,,,0
26,Melchiori,,,,,,,,,,0
27,"Chade, Lautaro",,,,,,,,,,0
28,Videla Gabriel,,,,,,,,,,0
29,Schuldt Adolfo,,,,,,,,,,0
30,Julian Rinaldi,,,,,,,,,,0
31,Alejandro Verio,,,,,,,,,,0
32,Charly Valenzuela,,,,,,,,,,0
33,Ezequiel Ramos,,,,,,,,,,0
34,Jony Alvarez,,,,,,,,,,0
35,Mariano Piola,,,,,,,,,,0
36,Mauri C,,,,,,,,,,0
37,Ale Antelo,,,,,,,,,,0
38,Migue Otero,,,,,,,,,,0
39,Agus Lening,,,,,,,,,,0
40,Seba Suarez,,,,,,,,,,0
41,Mauri Di giacomo Padre,,,,,,,,,,0
42,Seba Mendez,,,,,,,,,,0
43,Tamburrino,,,,,,,,,,0
44,Rojas Lucas,,,,,,,,,,0
45,"Souto, Lean",,,,,,,,,,0
46,"Fernandez, Tomás ",,,,,,,,,,0
47,"Alvarez, M",,,,,,,,,,0
48,Cabrera Martin,,,,,,,,,,0
49,Barbero D,,,,,,,,,,0
50,Gomez Sergio,,,,,,,,,,0
51,Gimenez A,,,,,,,,,,0
52,Rinaudo Joaquin,,,,,,,,,,0
53,Gomez Matu,,,,,,,,,,0`,

  "B1 2026": `POSICION,NOMBRE,Super 8/500,Super 8/250,Adelaide,AO,IW,,,,,TOTAL
1,"Toso, Marcel",500,,,,,,,,,500
2,Curti Rama,330,,,,,,,,,330
3,"Lerro, P",,250,,,,,,,,250
4,"Verio, Ale",200,,,,,,,,,200
5,"Rinaudo, Joaquin",200,,,,,,,,,200
6,"Guerra, facu",,165,,,,,,,,165
7,Gafni Edgardo,100,,,,,,,,,100
8,"Gil, G",100,,,,,,,,,100
9,Pablo Sepulveda,100,,,,,,,,,100
10,Petrilo Ale,100,,,,,,,,,100
11,Arevalo Ariel,,100,,,,,,,,100
12,"Lodico, G",,100,,,,,,,,100
13,"Romero, A",,50,,,,,,,,50
14,Milito Fede,,50,,,,,,,,50
15,Ruhl Alberto,,50,,,,,,,,50
16,"Gianni, Fer",,50,,,,,,,,50
17,"Castro, Ariel",,,,,,,,,,0
18,"Capurro, Martin",,,,,,,,,,0
19,"Fernandez, Tomi",,,,,,,,,,0
20,Nico Palmero,,,,,,,,,,0
21,Rezilo H,,,,,,,,,,0
22,"Medina, Mati",,,,,,,,,,0
23,"Vega, Fer",,,,,,,,,,0
24,Alvarez Martin,,,,,,,,,,0
25,Borelo Fabio,,,,,,,,,,0
26,"Melgarejo, Juan M",,,,,,,,,,0
27,"Scagliola, Gonza",,,,,,,,,,0
28,"De tina, Pablo",,,,,,,,,,0
29,"Chade, L",,,,,,,,,,0
30,"Guerra, Facu",,,,,,,,,,0
31,Mariano Juarez,,,,,,,,,,0
32,Videla Gabriel,,,,,,,,,,0
33,Acosta Lisandro,,,,,,,,,,0
34,Ale Gimenez,,,,,,,,,,0
35,Gabaldon Seba,,,,,,,,,,0
36,Fede Fernandez,,,,,,,,,,0
37,Julian Rinaldi,,,,,,,,,,0
38,Barbero Diego,,,,,,,,,,0
39,"Rizzo, Edu",,,,,,,,,,0
40,Matu Gomez,,,,,,,,,,0
41,Seba Mendez,,,,,,,,,,0
42,Juli Buriano,,,,,,,,,,0
43,Seba Suarez,,,,,,,,,,0
44,Martin Cabrera,,,,,,,,,,0
45,Agus Lening,,,,,,,,,,0
46,Sergio Gomez,,,,,,,,,,0
47,Santi Iacovino,,,,,,,,,,0
48,Ferro Fran,,,,,,,,,,0
49,Fer Femenia,,,,,,,,,,0
50,Mauri C,,,,,,,,,,0
51,Valenzuela Charly,,,,,,,,,,0
52,Mauri Di giacomo Padre,,,,,,,,,,0
53,Migue Otero,,,,,,,,,,0
54,Ale Antelo,,,,,,,,,,0
55,Daniel Calvo,,,,,,,,,,0
56,Fer Cutone,,,,,,,,,,0
57,Diego Magaldi,,,,,,,,,,0
58,Leo Heredia,,,,,,,,,,0
59,Oliva Fer,,,,,,,,,,0
60,Vazquez Nahuel,,,,,,,,,,0
61,Zupancic,,,,,,,,,,0
62,Ramos Ruben,,,,,,,,,,0
63,Ramos Ezequiel,,,,,,,,,,0
64,Tules Matias,,,,,,,,,,0`,

  "B2 2026": `POSICION,NOMBRE,Super 8/500,Super 8/250,Adelaide,AO,IW,,,,,TOTAL
1,"Oliva, Fer",500,,,,,,,,,500
2,"Barraza, Gerardo",330,,,,,,,,,330
3,"Lening, Agus",,250,,,,,,,,250
4,Ramos Ruben,200,,,,,,,,,200
5,"Zupancic, Cris",200,,,,,,,,,200
6,"Ramos, Ezequiel",100,,,,,,,,,100
7,"Tules, Matias",100,,,,,,,,,100
8,"Calvo, Daniel",100,,,,,,,,,100
9,"Vazquez, Nahuel",100,,,,,,,,,100
10,"Porciuncula, Pablo",,100,,,,,,,,100
11,"Sampaolesi, Juan p",,100,,,,,,,,100
12,Gelabert Leandro,,50,,,,,,,,50
13,"Lois, Fede",,50,,,,,,,,50
14,Peralta Gaston,,50,,,,,,,,50
15,"Capuya, Ali",,50,,,,,,,,50
16,"Andria, Emiliano",,,,,,,,,,0
17,"Augusto, Ale",,,,,,,,,,0
18,Rizzo Edu,,,,,,,,,,0
19,"Rezilo, Hernan",,,,,,,,,,0
20,"Baldino, Augusto",,,,,,,,,,0
21,"Gandolfo, Gerarado",,,,,,,,,,0
22,Pose Cris,,,,,,,,,,0
23,Peroti Ezequiel,,,,,,,,,,0
24,"Melgarejo, J",,,,,,,,,,0
25,"Lardapide, Facu",,,,,,,,,,0
26,"Eiriz, Esteban",,,,,,,,,,0
27,"Perropato, Pablo",,,,,,,,,,0
28,Juan Macri,,,,,,,,,,0
29,Martin S,,,,,,,,,,0
30,"Gatti, Pablo",,,,,,,,,,0
31,Rodriguez H,,,,,,,,,,0
32,Molina David,,,,,,,,,,0
33,Verdiani,,,,,,,,,,0
34,Lean Souto,,,,,,,,,,0
35,Suarez Roman,,,,,,,,,,0
36,Pautaso Lean,,,,,,,,,,0
37,Moulins Seba,,,,,,,,,,0
38,Ferro Fran,,,,,,,,,,0
39,Javier Q,,,,,,,,,,0
40,Gaston Dieser,,,,,,,,,,0
41,Gustavo Ponce,,,,,,,,,,0
42,Seba Mendez,,,,,,,,,,0
43,Ger Romanach,,,,,,,,,,0
44,Leo Sandoval,,,,,,,,,,0
45,Siri,,,,,,,,,,0
46,Ferreyra Oscar,,,,,,,,,,0
47,Caruso Jorge,,,,,,,,,,0
48,Giani F,,,,,,,,,,0
49,Valenzuela Charly,,,,,,,,,,0
50,Fede Fernandez,,,,,,,,,,0
51,Javier Fuseneco,,,,,,,,,,0
52,Pablo Sepulveda,,,,,,,,,,0
53,Santi Iacovino,,,,,,,,,,0
54,Daniel Torrico,,,,,,,,,,0
55,Uchima E,,,,,,,,,,0
56,Torres German,,,,,,,,,,0
57,Fede Agüero,,,,,,,,,,0
58,Catalini,,,,,,,,,,0`,

  "C 2026": `POSICION,NOMBRE,Super 8 / 500,Adelaide,AO,IW,,,,,,TOTAL
1,"Pautaso, Lean",500,,,,,,,,,500
2,"Molina, David",330,,,,,,,,,330
3,Eberle A,200,,,,,,,,,200
4,"Perropato, Pablo",200,,,,,,,,,200
5,"Rodriguez, Hector",100,,,,,,,,,100
6,"Catalini, Claudio",100,,,,,,,,,100
7,"Dimilta, Ruben",100,,,,,,,,,100
8,Verdiani,100,,,,,,,,,100
9,"Ferro, Fran",,,,,,,,,,0
10,Guardia Jony,,,,,,,,,,0
11,Juan Baleis,,,,,,,,,,0
12,"Alonso, Ricky",,,,,,,,,,0
13,Hornos Lean,,,,,,,,,,0
14,"Caruso, Jorge",,,,,,,,,,0
15,"Ferreyra, Oscar",,,,,,,,,,0
16,Franco Sabatino,,,,,,,,,,0
17,Meijomil R,,,,,,,,,,0
18,Tito Rizzo,,,,,,,,,,0
19,Lucas Riquelme,,,,,,,,,,0
20,"Candia, David",,,,,,,,,,0
21,Pena Fausto,,,,,,,,,,0
22,Pizzuti Nico,,,,,,,,,,0
23,"Topa, Federico",,,,,,,,,,0
24,"Lopes Rito, A",,,,,,,,,,0
25,Siri V,,,,,,,,,,0
26,Godoy D,,,,,,,,,,0
27,Barreto R,,,,,,,,,,0
28,Martin Picallo,,,,,,,,,,0
29,Coloseti M,,,,,,,,,,0
30,Colito A,,,,,,,,,,0
31,Atadia A,,,,,,,,,,0
32,Orellana A,,,,,,,,,,0
33,Cornejo C,,,,,,,,,,0
34,Nieto N,,,,,,,,,,0
35,Pantaneti F,,,,,,,,,,0
36,Joel,,,,,,,,,,0`,

  // --- INSCRIPTOS ---
  "Inscriptos": `Torneo,Categoria,Jugador,,,,,,
AO,B1,"Toso, Marcel",,,,,,
AO,B1,Curti Rama,,,,,,
AO,B1,"Lerro, P",,,,,,Siglas para los torneos:
AO,B1,"Verio, Ale",,,,,,"AO, Adelaide, S8 500, S8 250, IW, MC, RG, W, US)."
AO,B1,"Rinaudo, Joaquin",,,,,,
AO,B1,"Guerra, facu",,,,,,
AO,B1,Gafni Edgardo,,,,,,
AO,B1,"Gil, G",,,,,,
AO,B1,"Lodico, G",,,,,,
AO,B1,"Romero, A",,,,,,
AO,B1,Milito Fede,,,,,,
AO,B1,Ruhl Alberto,,,,,,
AO,B1,"Gianni, Fer",,,,,,
AO,B1,"Castro, Ariel",,,,,,
AO,B1,"Chade, L",,,,,,
AO,B1,"Gabaldon, Seba",,,,,,
AO,B1,Ferro Fran,,,,,,
AO,B2,"Oliva, Fer",,,,,,
AO,B2,Ramos Ruben,,,,,,
AO,B2,"Zupancic, Cris",,,,,,
AO,B2,"Ramos, Ezequiel",,,,,,
AO,B2,"Tules, Matias",,,,,,
AO,B2,"Calvo, Daniel",,,,,,
AO,B2,"Vazquez, Nahuel",,,,,,
AO,B2,"Lois, Fede",,,,,,
AO,B2,Peralta Gaston,,,,,,
AO,B2,"Capuya, Ali",,,,,,
AO,B2,Moulins Seba ,,,,,,
AO,B2,"Suarez, Roman",,,,,,
AO,B2,"Ferro, Fran",,,,,,
AO,B2,"Pautaso, Lean",,,,,,
AO,B2,"Molina, David",,,,,,
AO,B2,"Barraza, Gerardo",,,,,,
AO,B2,"Lening, Agus",,,,,,
US,C,"Pautaso, Lean",,,,,,
US,C,"Molina, David",,,,,,
US,C,Eberle A,,,,,,
US,C,"Dimilta, Ruben",,,,,,
US,C,"Rodriguez, Hector",,,,,,
US,C,"Perropato, Pablo",,,,,,
US,C,"Picallo, Martin",,,,,,
US,C,"Catalini, Claudio",,,,,,
US,C,Verdiani,,,,,,
US,C,"Pantanetti, Franco",,,,,,
US,C,"Colosetti, Matias",,,,,,
US,C,"Atadia, Ariel",,,,,,
US,C,"Ferreyra, Oscar",,,,,,`,

  // --- BRACKETS (CUADROS) ---
  "A Adelaide": `"Orso, C",,"Orso, C",6/1 - 6/2,"Orso, C"
BYE,,"Olivera, M",,Cobas
BYE,,"Bernal, L",,
"Olivera, M",,Cobas,,
"Bernal, L",,Dofigny,,
"Castro, A",,Chade,,
BYE,,"Tucci, M",,
Cobas,,"Palmero, T",,
Dofigny,,,,
BYE,,,,
Chade,,,,
Carrizo,,,,
"Tucci, M",,,,
BYE,,,,
BYE,,,,
"Palmero, T",,,,`,

  "C Adelaide": `"Caruso, J",,"Caruso, J"
"Barreto, R",,"Godoy, D"
"Godoy, D",,"Coloseti, M"
"Rodriguez, H",,"Molina, D"
"Coloseti, M",,"Pautaso, L"
"Riquelme, J",,"Eberle, A"
"Colito, A",,"Atadia, A"
"Molina, D",,"Ferreyra, O"
"Pautaso, L",,
"Cornejo, C",,
Joel,,
"Eberle, A",,
"Atadia, A",,
"Pantaneti, F",,
"Nieto, N",,
"Ferreyra, O",,`,

  "B1 S8 500": `"Toso, M",6/3 6/1,"Toso, M",,"Toso, M",,"Toso, M"
Petrillo,,Rinaudo,,Curti,,
Sepulveda,,Curti,,,,
Rinaudo,,"Verio, A",,,,
Curti,,,,,,
Gil,,,,,,
Gafni,,,,,,
"Verio, A",,,,,,`,

  "B2 S8 500": `"Oliva, F",6/3 6/1,"Oliva, F",,"Oliva, F",,"Oliva, F"
"Calvo, D",,Zupancic,,"Barraza, G",,
Zupancic,,"Ramos, R",,,,
"Tules, M",,"Barraza, G",,,,
"Ramos, R",,,,,,
"Vazquez, N",,,,,,
"Barraza, G",,,,,,
"Ramos, E",,,,,,`,

  "C S8 500": `"Pautaso, L",6/3 6/1,"Pautaso, L",,"Pautaso, L",,"Pautaso, L"
"Picallo, M",,"Perropato, P",,"Molina, D",,
"Perropato, P",,"Eberle, A",,,,
"Rodriguez, H",,"Molina, D",,,,
"Eberle, A",,,,,,
"Catalini, A",,,,,,
"Dimilita, R",,,,,,
"Molina, D",,,,,,`,

  "B1 S8 250": `"Romero, A",6/3 6/1,"Arevalo, A",,"Lerro, P",,"Lerro, P"
"Arevalo, A",,"Lerro, P",,"Guerra, F",,
"Lerro, P",,"Lodico, G",,,,
"Giani, F",,"Guerra, F",,,,
"Ruhl, A",,,,,,
"Lodico, G",,,,,,
"Guerra, F",,,,,,
"Milito, F",,,,,,`,

  "B2 S8 250": `"Lening, A",6/3 6/1,"Lening, A",,"Lening, A",,"Lening, A"
"Capuya, A",,Sampaolesi,,De Souza,,
"Lois, F",,De Souza,,,
Sampaolesi,,Porciuncula,,,
"Gelabert, L",,,,,,
De Souza,,,,,,
"Peralta, G",,,,,,
Porciuncula,,,,,,`,

  // --- GRUPOS ---
  "Grupos AO B1": `Zona 1,"Toso, Marcel","Romero, A","Lodico, G",Posicion,"Toso, Marcel","Romero, A",,,Puntaje matematico para la posicion
"Toso, Marcel",,6/4 6/1,6/2 1/6 6/4,1°,Curti Rama,Gafni Edgardo,,,20408
"Romero, A",4/6 1/6,,6/3 1/6 6/4,2°,"Lerro, P","Castro, Ariel",,,10200
"Lodico, G",2/6 6/1 4/6,3/6 6/1 4/6,,3°,"Verio, Ale","Chade, L",,,100
Zona 2,Curti Rama,"Gil, G",Gafni Edgardo,,Ferro Fran,"Rinaudo, Joaquin",,,0
Curti Rama,,,,1°,"Guerra, Facu","Gianni, Fer",,,0
"Gil, G",,,,1°,,,,,0
Gafni Edgardo,,,,1°,,,,,0
Zona 3,"Lerro, P","Castro, Ariel",-,,,,,,0
"Lerro, P",,,,1°,,,,,0
"Castro, Ariel",,,,1°,,,,,0
-,,,,1°,,,,,0
Zona 4,"Verio, Ale","Chade, L",Ruhl Alberto,,,,,,0
"Verio, Ale",,,,1°,,,,,0
"Chade, L",,,,1°,,,,,0
Ruhl Alberto,,,,1°,,,,,0`,

  // --- FORMATOS GRUPOS (PUNTAJES AGREGADOS) ---
  "Formatos Grupos": `Formatos,Columna A (Nombres),Columna B (Res),Columna C (Res),Columna D (Res),Posicion,,
1,Zona 1,,,,,,
2,Jugador 1,-,6-4 6-2,6-1 6-1,,,
3,Jugador 2,4-6 2-6,-,7-5 6-2,,,
4,Jugador 3,1-6 1-6,5-7 2-6,-,,,
5,Zona 2,,,,,,
6,Jugador A,-,...,...,,,
7,...,...,...,...,,,
,,,,,,,
Grupo [Torneo] [letra de categoria],,,,,,,
"si el grupo es de 2, dejar la fila siguiente con un -",,,,,,,
Columnas F y G para primeros y segundos de cada zona,,,,,,,
,,,,,,,
Fila 14 para determinar si es eliminacion directa o si es fase de grupos,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,Puntajes en orden:
,,,,,,,Ganador
,,,,,,,Finalista
,,,,,,,Semifinalistas
,,,,,,,Cuartos de final
,,,,,,,Octavos de final
,,,,,,,Dieciseisavos de final
,,,,,,,1 partido en el grupo
,,,,,,,
,,,,,,,
,,,,,,,
Puntajes Torneos,,,,,,,
,,,,,,,
,,,,,,,
AO,RG,Adelaide,S8 250,S8 500,,,
2000,2000,500,250,500,,,
1200,1200,300,150,300,,,
720,720,180,90,180,,,
360,360,90,45,90,,,
180,180,45,22,45,,,
90,90,22,11,22,,,
10,10,10,10,10,,,`
};

const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "AO", type: "full" }, 
  { id: "iw", name: "Indian Wells", short: "IW", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "MC", type: "full" },
  { id: "rg", name: "Roland Garros", short: "RG", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "W", type: "full" },
  { id: "us", name: "US Open", short: "US", type: "direct" },
]

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bracketData, setBracketData] = useState<any>({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} });
  const [groupData, setGroupData] = useState<any[]>([])
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBracket, setGeneratedBracket] = useState<any[]>([])
  const [isFixedData, setIsFixedData] = useState(false)
  
  // Estados para el calculador de Ranking Oculto
  const [footerClicks, setFooterClicks] = useState(0);
  const [showRankingCalc, setShowRankingCalc] = useState(false);
  const [calculatedRanking, setCalculatedRanking] = useState<any[]>([]);

  // PARSER MODIFICADO PARA LEER CORRECTAMENTE NOMBRES CON COMILLAS Y COMAS
  const parseCSV = (text: string) => {
    if (!text) return [];
    // Limpiamos \r que rompen los CSV generados en Windows/Excel
    return text.replace(/\r/g, '').trim().split('\n').map(row => 
      // Regex para separar por comas ignorando las que estan dentro de comillas
      row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c ? c.replace(/"/g, '').trim() : "")
    );
  };

  // --- LOGICA DE CALCULO DE RANKING (MODIFICADA OFFLINE) ---
  const handleFooterClick = () => {
      if (navState.level === "direct-bracket") {
          const newCount = footerClicks + 1;
          setFooterClicks(newCount);
          if (newCount >= 4) {
              calculateAndShowRanking();
              setFooterClicks(0); 
          }
      }
  };

  const calculateAndShowRanking = async () => {
    setIsLoading(true);
    try {
        // LEER DE VARIABLE OFFLINE
        const txt = OFFLINE_DATA["Formatos Grupos"];
        const rows = parseCSV(txt);

        if (rows.length < 2) throw new Error("No se encontraron datos en Formatos Grupos");

        let startRowIndex = -1;
        for(let i=0; i<rows.length; i++) {
            if (rows[i] && rows[i].join("").includes("Puntajes Torneos")) {
                startRowIndex = i + 3; // +3 filas abajo suelen estar los headers
                break;
            }
        }
        
        if (startRowIndex === -1) {
             startRowIndex = rows.length - 8; // Ajuste manual porque sabemos que están al final
        }

        const headerRow = rows[startRowIndex]; 
        const currentTourShort = navState.tournamentShort ? navState.tournamentShort.trim().toLowerCase() : "";
        
        let colIndex = -1;
        if(headerRow) {
            for(let i=0; i<headerRow.length; i++) {
                if (headerRow[i] && headerRow[i].trim().toLowerCase().includes(currentTourShort)) {
                    colIndex = i;
                    break;
                }
            }
        }

        const getPoints = (offset: number) => {
            if (colIndex === -1 || !rows[startRowIndex + offset]) return 0;
            const val = parseInt(rows[startRowIndex + offset][colIndex]);
            return isNaN(val) ? 0 : val;
        };

        const pts = {
            champion: getPoints(1),   
            finalist: getPoints(2),   
            semi: getPoints(3),       
            quarters: getPoints(4),   
            octavos: getPoints(5),    
            dieciseis: getPoints(6),  
            groupWin: getPoints(7)    
        };

        const playerScores: any = {};
        const addScore = (name: string, score: number) => {
            if (!name || name === "BYE" || name === "") return;
            const cleanName = name.trim();
            if (!playerScores[cleanName] || score > playerScores[cleanName]) {
                playerScores[cleanName] = score;
            }
        };

        if (bracketData.hasData) {
            const { r1, r2, r3, r4, winner, bracketSize } = bracketData;
            
            if (winner) addScore(winner, pts.champion);

            let finalists = [], semis = [], cuartos = [], octavos = [];

            if (bracketSize === 32) {
                finalists = r4; semis = r3; cuartos = r2; octavos = r1;
            } else if (bracketSize === 16) {
                finalists = r3; semis = r2; cuartos = r1;
            } else { // 8
                finalists = r2; semis = r1;
            }

            finalists.forEach((p: string) => { if (p && p !== winner) addScore(p, pts.finalist); });
            semis.forEach((p: string) => { if (p && !finalists.includes(p)) addScore(p, pts.semi); });
            cuartos.forEach((p: string) => { if (p && !semis.includes(p)) addScore(p, pts.quarters); });
            
            if (bracketSize >= 16) {
                 octavos.forEach((p: string) => { if (p && !cuartos.includes(p)) addScore(p, pts.octavos); });
            }
        }

        const rankingArray = Object.keys(playerScores).map(key => ({
            name: key,
            points: playerScores[key]
        })).sort((a, b) => b.points - a.points);

        setCalculatedRanking(rankingArray);
        setShowRankingCalc(true);

    } catch (e) {
        console.error(e);
        alert("Error calculando ranking.");
    } finally {
        setIsLoading(false);
    }
  };


  // --- MOTOR DE SORTEO DIRECTO (MODIFICADO OFFLINE) ---
  const runDirectDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setGeneratedBracket([]);
    setIsFixedData(false);
    
    try {
        // LEER RANKING OFFLINE
        const rankKey = `${categoryShort} 2026`;
        const rankCsv = OFFLINE_DATA[rankKey] || "";
        const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({
          name: row[1] || "",
          total: row[row.length-1] ? parseInt(row[row.length-1]) : 0
        })).filter(p => p.name !== "");

        // LEER INSCRIPTOS OFFLINE
        const inscCsv = OFFLINE_DATA["Inscriptos"];
        const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
          cols[0] === tournamentShort && cols[1] === categoryShort
        ).map(cols => cols[2]);

        if (filteredInscriptos.length < 4) {
            alert("Mínimo 4 jugadores para armar un cuadro.");
            setIsLoading(false);
            return;
        }

        const entryList = filteredInscriptos.map(n => {
            const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
            return { name: n, points: p ? p.total : 0 };
        }).sort((a, b) => b.points - a.points);

        const totalPlayers = entryList.length;
        let bracketSize = 4;
        if (totalPlayers > 4) bracketSize = 8;
        if (totalPlayers > 8) bracketSize = 16;
        if (totalPlayers > 16) bracketSize = 32;

        const byeCount = bracketSize - totalPlayers;
        let slots: any[] = Array(bracketSize).fill(null);
        
        let pos1 = 0;
        let pos2 = bracketSize - 1;
        let pos34 = [(bracketSize / 2) - 1, bracketSize / 2];
        let pos58: number[] = [];
        if (bracketSize === 16) pos58 = [2, 5, 10, 13]; 
        else if (bracketSize === 32) pos58 = [7, 8, 23, 24]; 
        
        const seeds = entryList.slice(0, 8).map((p, i) => ({ ...p, rank: i + 1 }));
        
        if (seeds[0]) slots[pos1] = seeds[0];
        if (seeds[1]) slots[pos2] = seeds[1];

        if (seeds[2] && seeds[3]) {
            const group34 = [seeds[2], seeds[3]].sort(() => Math.random() - 0.5);
            slots[pos34[0]] = group34[0]; 
            slots[pos34[1]] = group34[1]; 
        } else if (seeds[2]) {
             slots[pos34[Math.floor(Math.random()*2)]] = seeds[2];
        }

        if (seeds.length >= 8 && pos58.length === 4) {
            const group58 = seeds.slice(4, 8).sort(() => Math.random() - 0.5);
            const seedsTop = group58.slice(0, 2);
            const seedsBot = group58.slice(2, 4);
            const posTop = [pos58[0], pos58[1]].sort(() => Math.random() - 0.5);
            slots[posTop[0]] = seedsTop[0];
            slots[posTop[1]] = seedsTop[1];
            const posBot = [pos58[2], pos58[3]].sort(() => Math.random() - 0.5);
            slots[posBot[0]] = seedsBot[0];
            slots[posBot[1]] = seedsBot[1];
        }

        const getRivalIndex = (idx: number) => (idx % 2 === 0) ? idx + 1 : idx - 1;
        let byesRemaining = byeCount;

        for (let r = 1; r <= 8; r++) {
            if (byesRemaining > 0) {
                const seedIdx = slots.findIndex(s => s && s.rank === r);
                if (seedIdx !== -1) {
                    const rivalIdx = getRivalIndex(seedIdx);
                    if (slots[rivalIdx] === null) {
                        slots[rivalIdx] = { name: "BYE", rank: 0 };
                        byesRemaining--;
                    }
                }
            }
        }

        let emptyPairsIndices = []; 
        for (let i = 0; i < bracketSize; i += 2) {
             if (slots[i] === null && slots[i+1] === null) {
                 emptyPairsIndices.push(i);
             }
        }
        
        let topPairs = emptyPairsIndices.filter(i => i < bracketSize / 2);
        let botPairs = emptyPairsIndices.filter(i => i >= bracketSize / 2);
        
        const popBalancedPair = () => {
            if (topPairs.length > 0 && (botPairs.length === 0 || Math.random() > 0.5)) {
                 const randIdx = Math.floor(Math.random() * topPairs.length);
                 return topPairs.splice(randIdx, 1)[0];
            } else if (botPairs.length > 0) {
                 const randIdx = Math.floor(Math.random() * botPairs.length);
                 return botPairs.splice(randIdx, 1)[0];
            }
            return -1;
        };

        while (byesRemaining > 0) {
            const pairIdx = popBalancedPair();
            if (pairIdx !== -1) {
                const slotOffset = Math.random() > 0.5 ? 0 : 1;
                slots[pairIdx + slotOffset] = { name: "BYE", rank: 0 };
                byesRemaining--;
            } else { break; }
        }
        
        const nonSeeds = entryList.slice(8).map(p => ({ ...p, rank: 0 }));
        nonSeeds.sort(() => Math.random() - 0.5); 

        let countTop = slots.slice(0, bracketSize/2).filter(x => x !== null).length;
        let countBot = slots.slice(bracketSize/2).filter(x => x !== null).length;
        let emptySlots = slots.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
        
        for (const player of nonSeeds) {
             const emptyTop = emptySlots.filter(i => i < bracketSize/2);
             const emptyBot = emptySlots.filter(i => i >= bracketSize/2);
             let targetIdx = -1;

             if (countTop <= countBot && emptyTop.length > 0) {
                  targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
             } else if (emptyBot.length > 0) {
                  targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)];
             } else if (emptyTop.length > 0) { 
                  targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
             }

             if (targetIdx !== -1) {
                 slots[targetIdx] = player;
                 if (targetIdx < bracketSize/2) countTop++; else countBot++;
                 emptySlots = emptySlots.filter(i => i !== targetIdx);
             }
        }

        for (let i = 0; i < slots.length; i++) {
            if (slots[i] === null) slots[i] = { name: "BYE", rank: 0 };
        }

        let matches = [];
        for (let i = 0; i < bracketSize; i += 2) {
            let p1 = slots[i];
            let p2 = slots[i+1];
            if (p1?.name === "BYE" && p2?.name !== "BYE") {
                let temp = p1; p1 = p2; p2 = temp;
            }
            matches.push({ p1, p2 });
        }

        setGeneratedBracket(matches);
        setNavState({ ...navState, level: "generate-bracket", category: categoryShort, tournamentShort: tournamentShort, bracketSize: bracketSize });

    } catch (e) {
        alert("Error al generar sorteo directo.");
    } finally {
        setIsLoading(false);
    }
  }

  // --- MOTOR DE SORTEO ATP (GRUPOS - MODIFICADO OFFLINE) ---
  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setIsSorteoConfirmado(false);
    setIsFixedData(false);
    try {
      const rankKey = `${categoryShort} 2026`;
      const rankCsv = OFFLINE_DATA[rankKey] || "";
      const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({
        name: row[1] || "",
        total: row[row.length-1] ? parseInt(row[row.length-1]) : 0
      })).filter(p => p.name !== "");

      const inscCsv = OFFLINE_DATA["Inscriptos"];
      const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
        cols[0] === tournamentShort && cols[1] === categoryShort
      ).map(cols => cols[2]);

      if (filteredInscriptos.length === 0) {
        alert(`No hay inscriptos para ${tournamentShort} (${categoryShort}).`);
        setIsLoading(false);
        return;
      }

      const entryList = filteredInscriptos.map(n => {
        const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
        return { name: n, points: p ? p.total : 0 };
      }).sort((a, b) => b.points - a.points);

      const totalPlayers = entryList.length;
      if (totalPlayers < 2) { alert("Mínimo 2 jugadores."); setIsLoading(false); return; }

      let groupsOf3 = 0;
      let groupsOf2 = 0;
      const remainder = totalPlayers % 3;

      if (remainder === 0) {
        groupsOf3 = totalPlayers / 3;
      } else if (remainder === 1) {
        groupsOf2 = 2;
        groupsOf3 = (totalPlayers - 4) / 3;
      } else if (remainder === 2) {
        groupsOf2 = 1;
        groupsOf3 = (totalPlayers - 2) / 3;
      }

      let capacities = [];
      for(let i=0; i<groupsOf3; i++) capacities.push(3);
      for(let i=0; i<groupsOf2; i++) capacities.push(2);
      
      capacities = capacities.sort(() => Math.random() - 0.5);

      const numGroups = capacities.length;
      let groups = capacities.map((cap, i) => ({
        groupName: `Zona ${i + 1}`,
        capacity: cap,
        players: [],
        results: [["-","-","-"], ["-","-","-"], ["-","-","-"]],
        positions: ["-", "-", "-"]
      }));

      for (let i = 0; i < numGroups; i++) {
        if (entryList[i]) groups[i].players.push(entryList[i].name);
      }

      const restOfPlayers = entryList.slice(numGroups).sort(() => Math.random() - 0.5);
      
      let pIdx = 0;
      for (let g = 0; g < numGroups; g++) {
        while (groups[g].players.length < groups[g].capacity && pIdx < restOfPlayers.length) {
          groups[g].players.push(restOfPlayers[pIdx].name);
          pIdx++;
        }
      }

      setGroupData(groups);
      setNavState({ ...navState, level: "group-phase", currentCat: categoryShort, currentTour: tournamentShort });
    } catch (e) {
      alert("Error al procesar el sorteo.");
    } finally { setIsLoading(false); }
  }

  // --- LECTURA DE GRUPOS FIJOS (MODIFICADO OFFLINE) ---
  const fetchGroupPhase = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setGroupData([]);
    setIsSorteoConfirmado(false);
    setIsFixedData(false);
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sheetName = `Grupos ${tournamentShort} ${categoryShort}`;
      const csvText = OFFLINE_DATA[sheetName] || "";
      
      let foundGroups = false;

      if (csvText && (csvText.includes("Zona") || csvText.includes("Grupo"))) {
        const rows = parseCSV(csvText);
        const parsedGroups = [];
        for (let i = 0; i < rows.length; i += 4) {
          if (rows[i] && rows[i][0] && (rows[i][0].includes("Zona") || rows[i][0].includes("Grupo"))) {
            
            const playersRaw = [rows[i+1], rows[i+2], rows[i+3]];
            const validPlayersIndices = [];
            const players = [];
            const positions = [];

            playersRaw.forEach((row, index) => {
                if (row && row[0] && row[0] !== "-" && row[0] !== "") {
                    players.push(row[0]);
                    let rawPos = row[4] || "";
                    if (rawPos.startsWith("#")) rawPos = "-";
                    positions.push(rawPos); 
                    validPlayersIndices.push(index); 
                }
            });

            const results = [];
            for (let x = 0; x < validPlayersIndices.length; x++) {
                const rowResults = [];
                const rowIndex = validPlayersIndices[x]; 
                for (let y = 0; y < validPlayersIndices.length; y++) {
                    const colIndex = validPlayersIndices[y];
                    const res = rows[i + 1 + rowIndex][1 + colIndex]; 
                    rowResults.push(res);
                }
                results.push(rowResults);
            }

            parsedGroups.push({
              groupName: rows[i][0],
              players: players,
              results: results,
              positions: positions
            });
          }
        }
        
        if (parsedGroups.length > 0) {
          setGroupData(parsedGroups);
          setIsSorteoConfirmado(true);
          setIsFixedData(true);
          foundGroups = true;
          setNavState({ 
            ...navState, 
            level: "tournament-phases", 
            currentCat: categoryShort, 
            currentTour: tournamentShort,
            hasGroups: true 
          });
        }
      } 
      
      if (!foundGroups) {
        setNavState({ 
            ...navState, 
            level: "tournament-phases", 
            currentCat: categoryShort, 
            currentTour: tournamentShort,
            hasGroups: false 
        });
      }

    } catch (e) {
        setNavState({ 
            ...navState, 
            level: "tournament-phases", 
            currentCat: categoryShort, 
            currentTour: tournamentShort,
            hasGroups: false 
        });
    } finally { setIsLoading(false); }
  }

  const confirmarYEnviar = () => {
    let mensaje = `*SORTEO CONFIRMADO - ${navState.tournamentShort}*\n*Categoría:* ${navState.category}\n\n`;
    
    // Si tenemos un cuadro generado nuevo, lo usamos
    if (generatedBracket.length > 0) {
        generatedBracket.forEach((match) => {
            const p1Name = match.p1 ? match.p1.name : "TBD";
            const p2Name = match.p2 ? match.p2.name : "TBD"; 
            mensaje += `${p1Name} vs ${p2Name}\n`;
        });
    } 
    // Si estamos viendo un cuadro existente (bracketData), enviamos los cruces de primera ronda
    else if (bracketData.hasData) {
        const { r1, s1, bracketSize } = bracketData;
        const matchesCount = bracketSize === 32 ? 16 : (bracketSize === 16 ? 8 : 4);
        
        for(let i=0; i<matchesCount; i++) {
            const p1 = r1[i*2] || "TBD";
            const p2 = r1[i*2+1] || "TBD";
            mensaje += `${p1} vs ${p2}\n`;
        }
    } else {
        mensaje += "No hay datos para enviar.";
    }
    
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const GroupTable = ({ group }: { group: any }) => {
    const totalPlayers = group.players.length;
    let isComplete = true;

    for (let i = 0; i < totalPlayers; i++) {
        for (let j = 0; j < totalPlayers; j++) {
           if (i === j) continue; 
           const val = group.results[i]?.[j];
           if (!val || val.trim() === "-" || val.trim().length < 2) {
             isComplete = false;
             break;
           }
        }
        if (isComplete) break;
    }

    return (
    <div className="bg-white border-2 border-[#b35a38]/20 rounded-2xl overflow-hidden shadow-lg mb-4 text-center h-fit overflow-hidden">
      <div className="bg-[#b35a38] p-3 text-white font-black italic text-center uppercase tracking-wider">{group.groupName}</div>
      <style jsx>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="overflow-x-auto w-full hide-scroll">
          <table className="w-max min-w-full text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 border-r w-32 text-left font-bold text-black min-w-[120px] whitespace-nowrap">JUGADOR</th>
                {group.players && group.players.map((p: string, i: number) => {
                  let shortName = p;
                  if (p) {
                      const clean = p.replace(/,/g, "").trim().split(/\s+/);
                      if (clean.length > 1) {
                          shortName = `${clean[0]} ${clean[1].charAt(0)}.`;
                      } else {
                          shortName = clean[0];
                      }
                  }
                  return (
                    <th key={i} className="p-3 border-r text-center font-black text-[#b35a38] uppercase min-w-[80px] whitespace-nowrap">
                        {shortName}
                    </th>
                  )
                })}
                {isComplete && <th className="p-3 text-center font-black text-black bg-slate-100 w-12 whitespace-nowrap">POS</th>}
              </tr>
            </thead>
            <tbody>
              {group.players && group.players.map((p1: string, i: number) => (
                <tr key={i} className="border-b">
                  <td className="p-3 border-r font-black bg-slate-50 uppercase text-[#b35a38] text-left whitespace-nowrap">{p1}</td>
                  {group.players.map((p2: string, j: number) => (
                    <td key={j} className={`p-2 border-r text-center font-black text-slate-700 whitespace-nowrap text-sm md:text-base ${i === j ? 'bg-slate-100 text-slate-300' : ''}`}>
                      {i === j ? "/" : (group.results[i] && group.results[i][j] ? group.results[i][j] : "-")}
                    </td>
                  ))}
                  {isComplete && (
                      <td className="p-3 text-center font-black text-[#b35a38] text-xl bg-slate-50 whitespace-nowrap">
                          {group.positions && group.positions[i] && !isNaN(group.positions[i]) 
                          ? `${group.positions[i]}°` 
                          : (group.positions[i] === "-" ? "-" : group.positions[i])}
                      </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
    );
  };

  // --- SORTEO CUADRO FINAL (Desde Grupos) ---
  const generatePlayoffBracket = (qualifiers: any[]) => {
    const totalPlayers = qualifiers.length;
    let bracketSize = 8;
    if (totalPlayers > 16) bracketSize = 32; 
    else if (totalPlayers > 8) bracketSize = 16; 
    else if (totalPlayers > 4) bracketSize = 8; 
    else bracketSize = 4; 

    const byeCount = bracketSize - totalPlayers;
    const numMatches = bracketSize / 2;
    const halfMatches = numMatches / 2;

    const winners = qualifiers.filter(q => q.rank === 1).sort((a, b) => a.groupIndex - b.groupIndex); 
    const runners = qualifiers.filter(q => q.rank === 2).sort(() => Math.random() - 0.5); 

    const playersWithBye = new Set();
    for(let i=0; i < byeCount; i++) {
        if(winners[i]) playersWithBye.add(winners[i].name);
        else if(runners[i - winners.length]) playersWithBye.add(runners[i - winners.length].name);
    }

    let matches: any[] = Array(numMatches).fill(null).map(() => ({ p1: null, p2: null }));

    const wZ1 = winners.find(w => w.groupIndex === 0);
    const wZ2 = winners.find(w => w.groupIndex === 1);
    const wZ3 = winners.find(w => w.groupIndex === 2);
    const wZ4 = winners.find(w => w.groupIndex === 3);
    const otherWinners = winners.filter(w => w.groupIndex > 3).sort(() => Math.random() - 0.5);

    const idxTop = 0; 
    const idxBottom = numMatches - 1;
    const idxMidTop = halfMatches - 1; 
    const idxMidBottom = halfMatches; 

    if (wZ1) matches[idxTop].p1 = wZ1;
    if (wZ2) matches[idxBottom].p1 = wZ2;

    const mids = [wZ3, wZ4].filter(Boolean).sort(() => Math.random() - 0.5);
    if (mids.length > 0) matches[idxMidTop].p1 = mids[0];
    if (mids.length > 1) matches[idxMidBottom].p1 = mids[1];

    matches.forEach(m => {
        if (!m.p1 && otherWinners.length > 0) m.p1 = otherWinners.pop();
    });

    const topHalfMatches = matches.slice(0, halfMatches);
    const bottomHalfMatches = matches.slice(halfMatches);

    const zonesInTop = new Set(topHalfMatches.map(m => m.p1?.groupIndex).filter(i => i !== undefined));
    const zonesInBottom = new Set(bottomHalfMatches.map(m => m.p1?.groupIndex).filter(i => i !== undefined));

    const mustGoBottom = runners.filter(r => zonesInTop.has(r.groupIndex));
    const mustGoTop = runners.filter(r => zonesInBottom.has(r.groupIndex));
    const freeAgents = runners.filter(r => !zonesInTop.has(r.groupIndex) && !zonesInBottom.has(r.groupIndex));

    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
    let poolTop = shuffle([...mustGoTop]);
    let poolBottom = shuffle([...mustGoBottom]);
    let poolFree = shuffle([...freeAgents]);

    while (poolTop.length < halfMatches && poolFree.length > 0) poolTop.push(poolFree.pop());
    while (poolBottom.length < (numMatches - halfMatches) && poolFree.length > 0) poolBottom.push(poolFree.pop());
    
    poolTop = shuffle(poolTop);
    poolBottom = shuffle(poolBottom);

    matches.forEach((match, index) => {
        const isTopHalf = index < halfMatches;
        let pool = isTopHalf ? poolTop : poolBottom;

        if (match.p1) {
            if (playersWithBye.has(match.p1.name)) {
                match.p2 = { name: "BYE", rank: 0, groupIndex: -1 };
            } else {
                if (pool.length > 0) {
                    match.p2 = pool.pop();
                } else {
                    match.p2 = { name: "TBD", rank: 0 };
                }
            }
        } else {
            if (pool.length >= 2) {
                match.p1 = pool.pop();
                match.p2 = pool.pop();
            } else if (pool.length === 1) {
                match.p1 = pool.pop();
                match.p2 = { name: "BYE", rank: 0 };
            }
        }
    });

    return { matches, bracketSize };
  }

  const fetchQualifiersAndDraw = async (category: string, tournamentShort: string) => {
      setIsLoading(true);
      setGeneratedBracket([]);
      
      const sheetName = `Grupos ${tournamentShort} ${category}`;
      const csvText = OFFLINE_DATA[sheetName] || "";
      
      try {
          const rows = parseCSV(csvText);
          
          let qualifiers = [];
          
          for(let i = 0; i < 50; i++) { 
              if (rows[i] && rows[i].length > 5) {
                  const winnerName = rows[i][5]; 
                  const runnerName = rows[i].length > 6 ? rows[i][6] : null; 
                  
                  if (winnerName && winnerName !== "-" && winnerName !== "" && !winnerName.toLowerCase().includes("1ro")) {
                      qualifiers.push({ name: winnerName, rank: 1, groupIndex: i });
                  }
                  if (runnerName && runnerName !== "-" && runnerName !== "" && !runnerName.toLowerCase().includes("2do")) {
                      qualifiers.push({ name: runnerName, rank: 2, groupIndex: i });
                  }
              }
          }

          if (qualifiers.length >= 3) { 
             const result = generatePlayoffBracket(qualifiers);
             if (result) {
                 setGeneratedBracket(result.matches);
                 setNavState({ ...navState, level: "generate-bracket", category, tournamentShort, bracketSize: result.bracketSize });
             }
          } else {
             alert(`Solo se encontraron ${qualifiers.length} clasificados. Verifica la hoja ${sheetName}.`);
          }

      } catch (e) {
          console.error(e);
          alert("Error leyendo los clasificados.");
      } finally {
          setIsLoading(false);
      }
  }

  const confirmarSorteoCuadro = () => {
    let mensaje = `*SORTEO CUADRO FINAL - ${navState.tournamentShort}*\n*Categoría:* ${navState.category}\n\n`;
    
    // Si tenemos un cuadro generado nuevo, lo usamos
    if (generatedBracket.length > 0) {
        generatedBracket.forEach((match) => {
            const p1Name = match.p1 ? match.p1.name : "TBD";
            const p2Name = match.p2 ? match.p2.name : "TBD"; 
            mensaje += `${p1Name} vs ${p2Name}\n`;
        });
    } 
    // Si estamos viendo un cuadro existente (bracketData), enviamos los cruces de primera ronda
    else if (bracketData.hasData) {
        const { r1, s1, bracketSize } = bracketData;
        const matchesCount = bracketSize === 32 ? 16 : (bracketSize === 16 ? 8 : 4);
        
        for(let i=0; i<matchesCount; i++) {
            const p1 = r1[i*2] || "TBD";
            const p2 = r1[i*2+1] || "TBD";
            mensaje += `${p1} vs ${p2}\n`;
        }
    } else {
        mensaje += "No hay datos para enviar.";
    }
    
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // --- RANKING (MODIFICADO OFFLINE) ---
  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true); setRankingData([]); setHeaders([]);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const key = `${categoryShort} ${year}`;
      const csvText = OFFLINE_DATA[key] || "";
      const rows = parseCSV(csvText);
      
      if (rows.length > 0) {
        setHeaders(year === "2025" ? rows[0].slice(2, 9) : rows[0].slice(2, 11));
        setRankingData(rows.slice(1).map(row => ({
          name: row[1],
          points: year === "2025" ? row.slice(2, 9) : row.slice(2, 11),
          total: row[row.length - 1] ? (parseInt(row[row.length - 1]) || 0) : 0
        })).filter(p => p.name).sort((a, b) => b.total - a.total));
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  // --- BRACKETS (MODIFICADO OFFLINE) ---
  const fetchBracketData = async (category: string, tournamentShort: string) => {
    setIsLoading(true); 
    setBracketData({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const bracketKey = `${category} ${tournamentShort}`;
      const csvText = OFFLINE_DATA[bracketKey] || "";
      const rows = parseCSV(csvText);
      
      const checkCanGenerate = async () => {
        const isDirect = tournaments.find(t => t.short === tournamentShort)?.type === "direct";
        if (isDirect) {
            const inscCsv = OFFLINE_DATA["Inscriptos"];
            const r = parseCSV(inscCsv);
            const count = r.filter(x => x[0] === tournamentShort && x[1] === category).length;
            setBracketData({ hasData: false, canGenerate: count >= 4 });
        } else {
            const sheetNameGroups = `Grupos ${tournamentShort} ${category}`;
            const groupCsv = OFFLINE_DATA[sheetNameGroups] || "";
            const gRows = parseCSV(groupCsv);
            let foundQualifiers = false;
            for(let i=0; i<Math.min(gRows.length, 50); i++) {
                if (gRows[i] && gRows[i].length > 5 && gRows[i][5]) {
                    foundQualifiers = true;
                    break;
                }
            }
            setBracketData({ hasData: false, canGenerate: foundQualifiers });
        }
      };

      const hasContent = rows.length > 0 && rows[0] && rows[0][0] && rows[0][0] !== "";

      if (hasContent) {
          // *** DETECCIÓN DE TAMAÑO (SUPER 8 vs OCTAVOS vs 32) ***
          const playersInCol1 = rows.filter(r => r[0] && r[0].trim() !== "" && r[0] !== "-").length;
          
          let bracketSize = 16; // Default
          if (playersInCol1 > 16) bracketSize = 32;
          else if (playersInCol1 <= 8) bracketSize = 8; // Super 8

          let seeds = {};
          try {
             const rankKey = `${category} 2026`;
             const rankCsv = OFFLINE_DATA[rankKey] || "";
             const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({
               name: row[1] || "",
               total: row[row.length-1] ? parseInt(row[row.length-1]) : 0
             })).filter(p => p.name !== "");

             const inscCsv = OFFLINE_DATA["Inscriptos"];
             const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
               cols[0] === tournamentShort && cols[1] === category
             ).map(cols => cols[2]);

             const entryList = filteredInscriptos.map(n => {
                 const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
                 return { name: n, points: p ? p.total : 0 };
             }).sort((a, b) => b.points - a.points);

             const top8 = entryList.slice(0, 8);
             const seedMap: any = {};
             top8.forEach((p, i) => { if (p.name) seedMap[p.name] = i + 1; });
             seeds = seedMap;
          } catch(e) { console.log("Error fetching seeds", e); }

          let rawData: any = {};
          if (bracketSize === 32) {
            rawData = { r1: rows.map(r => r[0]).slice(0, 32), s1: rows.map(r => r[1]).slice(0, 32), r2: rows.map(r => r[2]).slice(0, 16), s2: rows.map(r => r[3]).slice(0, 16), r3: rows.map(r => r[4]).slice(0, 8), s3: rows.map(r => r[5]).slice(0, 8), r4: rows.map(r => r[6]).slice(0, 4), s4: rows.map(r => r[7]).slice(0, 4), winner: rows[0][8] || "", bracketSize: 32, hasData: true, canGenerate: false, seeds: seeds };
          } else if (bracketSize === 16) {
            rawData = { r1: rows.map(r => r[0]).slice(0, 16), s1: rows.map(r => r[1]).slice(0, 16), r2: rows.map(r => r[2]).slice(0, 8), s2: rows.map(r => r[3]).slice(0, 8), r3: rows.map(r => r[4]).slice(0, 4), s3: rows.map(r => r[5]).slice(0, 4), r4: [], s4: [], winner: rows[0][6] || "", bracketSize: 16, hasData: true, canGenerate: false, seeds: seeds };
          } else {
            // Super 8: La col 0 es Cuartos
            rawData = { r1: rows.map(r => r[0]).slice(0, 8), s1: rows.map(r => r[1]).slice(0, 8), r2: rows.map(r => r[2]).slice(0, 4), s2: rows.map(r => r[3]).slice(0, 4), r3: [], s3: [], r4: [], s4: [], winner: rows[0][4] || "", bracketSize: 8, hasData: true, canGenerate: false, seeds: seeds };
          }
          
          if (bracketSize !== 8) rawData = processByes(rawData); 
          setBracketData(rawData);

      } else { await checkCanGenerate(); }

    } catch (error) { console.log(error); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    setIsSorteoConfirmado(false);
    const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection", "damas-empty": "category-selection", "generate-bracket": "direct-bracket" };
    setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";

  // COMPONENTE VISUAL MEJORADO (LISTA VERTICAL)
  const GeneratedMatch = ({ match }: { match: any }) => (
      <div className="relative flex flex-col space-y-4 mb-8 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
              {match.p1 && <span className="text-orange-500 font-black text-lg w-16 text-right whitespace-nowrap">{match.p1.rank > 0 ? (match.p1.groupIndex !== undefined ? `${match.p1.rank}º Z${match.p1.groupIndex + 1}` : `${match.p1.rank}.`) : ""}</span>}
              <span className={`font-black text-xl uppercase truncate ${match.p1 ? 'text-slate-800' : 'text-slate-300'}`}>
                  {match.p1 ? match.p1.name : ""}
              </span>
          </div>
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
              {match.p2 && match.p2.name !== 'BYE' && <span className="text-orange-500 font-black text-lg w-16 text-right whitespace-nowrap">{match.p2.rank > 0 ? (match.p2.groupIndex !== undefined ? `${match.p2.rank}º Z${match.p2.groupIndex + 1}` : `${match.p2.rank}.`) : ""}</span>}
              <span className={`font-black text-xl uppercase truncate ${match.p2?.name === 'BYE' ? 'text-green-600' : (match.p2 ? 'text-slate-800' : 'text-slate-300')}`}>
                  {match.p2 ? match.p2.name : ""}
              </span>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty', 'generate-bracket'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
        <div className="text-center mb-8">
            <div className="flex justify-center mb-5 text-center">
                <div className="relative group w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-[#b35a38]/20 blur-2xl rounded-full opacity-100 transition-opacity duration-500" />
                <Image src="/logo.png" alt="Logo" width={280} height={280} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
                </div>
            </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest italic text-center">Club de Tenis</p>
        </div>

        {navState.level !== "home" && <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-500 font-bold">← VOLVER</Button>}

        {isLoading && <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#b35a38] animate-spin" /></div>}

        <div className="space-y-4 max-w-xl mx-auto">
          {navState.level === "home" && <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>}
          {navState.level === "main-menu" && <div className="grid grid-cols-1 gap-4 text-center"><Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button><Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button><Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 opacity-50" /> RANKING</Button></div>}
          {navState.level === "year-selection" && <div className="space-y-4 text-center"><Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button><Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button></div>}
          
          {navState.level === "category-selection" && (
            <div className="space-y-4 text-center">
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "damas") { setNavState({ ...navState, level: "damas-empty", selectedCategory: cat }); }
                  else if (navState.type === "ranking") { fetchRankingData(catShort, navState.year); setNavState({ ...navState, level: "ranking-view", selectedCategory: cat, year: navState.year }); }
                  else { setNavState({ ...navState, level: "tournament-selection", category: catShort, selectedCategory: cat, gender: navState.type }); }
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-selection" && (
            <div className="space-y-4 text-center">
              {tournaments.filter(t => {
                if (t.id === "adelaide" && navState.gender === "damas") return false;
                if ((t.id === "s8_500" || t.id === "s8_250") && navState.category === "A") return false;
                if (t.id === "s8_250" && navState.category === "C") return false;
                return true;
              }).map((t) => (
                <Button key={t.id} onClick={() => {
                  if (t.type === "direct") { fetchBracketData(navState.category, t.short); setNavState({ ...navState, level: "direct-bracket", tournament: t.name, tournamentShort: t.short }); }
                  else { fetchGroupPhase(navState.category, t.short); }
                }} className={buttonStyle}>{t.name}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center text-center">
              <h2 className="text-2xl font-black mb-4 text-slate-800 uppercase">Fases del Torneo</h2>
              {navState.hasGroups ? (
                <>
                  <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
                  <Button onClick={() => { fetchBracketData(navState.currentCat, navState.currentTour); setNavState({ ...navState, level: "direct-bracket", tournament: navState.currentTour, tournamentShort: navState.currentTour }); }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro Final</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className={buttonStyle}><RefreshCw className="mr-2" /> Realizar Sorteo ATP</Button>
                  <Button onClick={() => { fetchBracketData(navState.currentCat, navState.currentTour); setNavState({ ...navState, level: "direct-bracket", tournament: navState.currentTour, tournamentShort: navState.currentTour }); }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- PANTALLA DE SORTEO GENERADO (VISUAL LISTA UNICA) --- */}
        {navState.level === "generate-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center">
             <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic min-w-[300px] mx-auto sticky left-0">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
                   {navState.bracketSize === 32 ? "Sorteo 16avos" : 
                    navState.bracketSize === 16 ? "Sorteo Octavos" : 
                    navState.bracketSize === 8 ? "Sorteo Cuartos" : "Sorteo Semis"}
               </h2>
             </div>
             <div className="flex flex-col items-center gap-2 mb-8">
                {generatedBracket.map((match, i) => (
                    <>
                        <GeneratedMatch key={i} match={match} />
                        {i === (generatedBracket.length / 2) - 1 && (
                            <div className="w-full max-w-md my-8 flex items-center gap-4 opacity-50">
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Mitad de Cuadro</span>
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
                            </div>
                        )}
                    </>
                ))}
             </div>

             <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 sticky bottom-4 z-20">
                {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                   <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg">
                       <Shuffle className="mr-2 w-4 h-4" /> Sortear
                   </Button>
                ) : (
                   <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg">
                       <Shuffle className="mr-2 w-4 h-4" /> Sortear
                   </Button>
                )}
                <Button onClick={confirmarSorteoCuadro} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                <Button onClick={() => setNavState({ ...navState, level: "direct-bracket" })} className="bg-red-600 text-white font-bold h-12 px-8"><Trash2 className="mr-2" /> ELIMINAR</Button>
             </div>
          </div>
        )}

        {navState.level === "damas-empty" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-12 shadow-2xl text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-[#b35a38] mb-6 uppercase italic">{navState.selectedCategory}</h2>
            <div className="p-10 border-4 border-dashed border-slate-100 rounded-3xl">
              <Users className="w-20 h-20 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-xl uppercase tracking-widest text-center">No hay torneos activos por el momento</p>
            </div>
          </div>
        )}

        {navState.level === "group-phase" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px] text-center">
            <div className="flex justify-between items-center mb-8">
              <Button onClick={goBack} variant="outline" size="sm" className="border-[#b35a38] text-[#b35a38] font-bold"><ArrowLeft className="mr-2" /> ATRÁS</Button>
              {!isSorteoConfirmado && !isFixedData && (
                <div className="flex space-x-2 text-center text-center">
                  <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className="bg-green-600 text-white font-bold"><Shuffle className="mr-2" /> SORTEAR</Button>
                  <Button onClick={confirmarYEnviar} size="sm" className="bg-green-600 text-white font-bold px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                  <Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} size="sm" variant="destructive" className="font-bold"><Trash2 className="mr-2" /> ELIMINAR</Button>
                </div>
              )}
            </div>
            <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{navState.currentTour} - Fase de Grupos</h2>
              <p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {groupData.map((group, idx) => <GroupTable key={idx} group={group} />)}
            </div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-4 shadow-2xl text-center w-full">
            <div className="bg-[#b35a38] p-3 rounded-2xl mb-6 text-center text-white italic min-w-[300px] md:min-w-[800px] mx-auto">
              <h2 className="text-2xl font-black uppercase tracking-wider">{navState.tournament} - {navState.selectedCategory}</h2>
            </div>
            
            {bracketData.hasData ? (
              <div className="flex flex-row items-stretch justify-between w-full h-full min-h-[600px] px-2 relative text-center">
                
                {/* 16AVOS (Solo si es de 32) */}
                {bracketData.bracketSize === 32 && (
                  <div className="flex flex-col justify-around flex-1 items-center relative">
                    {Array.from({length: 16}, (_, i) => i * 2).map((idx) => {
                      const p1 = bracketData.r1[idx]; const p2 = bracketData.r1[idx+1];
                      const w1 = p1 && bracketData.r2.includes(p1);
                      const w2 = p2 && bracketData.r2.includes(p2);
                      const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                      const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                      return (
                        <div key={idx} className="relative flex flex-col w-full max-w-[140px] mb-2">
                          <div className={`h-6 border-b-[1px] ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                            <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-xs uppercase truncate w-full text-left`}>
                                {seed1 ? <span className="text-xs text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-xs ml-1">{bracketData.s1[idx]}</span>
                          </div>
                          <div className={`h-6 border-b-[1px] ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                            <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-xs uppercase truncate w-full text-left`}>
                                {seed2 ? <span className="text-xs text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-xs ml-1">{bracketData.s1[idx+1]}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* OCTAVOS (Si es > 8) */}
                {bracketData.bracketSize >= 16 && (
                <div className="flex flex-col justify-around flex-1 items-center relative">
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((idx) => {
                    const r = bracketData.bracketSize === 32 ? bracketData.r2 : bracketData.r1;
                    const s = bracketData.bracketSize === 32 ? bracketData.s2 : bracketData.s1;
                    const nextR = bracketData.bracketSize === 32 ? bracketData.r3 : bracketData.r2;
                    
                    const p1 = r[idx]; const p2 = r[idx+1];
                    const w1 = p1 && nextR.includes(p1);
                    const w2 = p2 && nextR.includes(p2);
                    const s1 = s[idx]; const s2 = s[idx+1];
                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                    return (
                      <div key={idx} className="relative flex flex-col w-full max-w-[140px] mb-2">
                        <div className={`h-6 border-b-[1px] ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                            <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate w-full text-left`}>
                                {seed1 ? <span className="text-sm text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-sm ml-2">{s1}</span>
                        </div>
                        <div className={`h-6 border-b-[1px] ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                            <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate w-full text-left`}>
                                {seed2 ? <span className="text-sm text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-sm ml-2">{s2}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}

                {/* CUARTOS (Siempre) */}
                <div className="flex flex-col justify-around flex-1 items-center relative">
                  {[0, 2, 4, 6].map((idx) => {
                    const r = bracketData.bracketSize === 32 ? bracketData.r3 : (bracketData.bracketSize === 16 ? bracketData.r2 : bracketData.r1);
                    const s = bracketData.bracketSize === 32 ? bracketData.s3 : (bracketData.bracketSize === 16 ? bracketData.s2 : bracketData.s1);
                    const nextR = bracketData.bracketSize === 32 ? bracketData.r4 : (bracketData.bracketSize === 16 ? bracketData.r3 : bracketData.r2);

                    const p1 = r[idx]; const p2 = r[idx+1];
                    const w1 = p1 && nextR.includes(p1);
                    const w2 = p2 && nextR.includes(p2);
                    const s1 = s[idx]; const s2 = s[idx+1];
                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                    return (
                      <div key={idx} className="relative flex flex-col w-full max-w-[140px] mb-2">
                        <div className={`h-6 border-b-[1px] ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                            <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate w-full text-left`}>
                                {seed1 ? <span className="text-sm text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-sm ml-1">{s1}</span>
                        </div>
                        <div className={`h-6 border-b-[1px] ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                            <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate w-full text-left`}>
                                {seed2 ? <span className="text-sm text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-sm ml-1">{s2}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SEMIS (Siempre) */}
                <div className="flex flex-col justify-around flex-1 items-center relative">
                  {[0, 2].map((idx) => {
                     const r = bracketData.bracketSize === 32 ? bracketData.r4 : (bracketData.bracketSize === 16 ? bracketData.r3 : bracketData.r2);
                     const s = bracketData.bracketSize === 32 ? bracketData.s4 : (bracketData.bracketSize === 16 ? bracketData.s3 : bracketData.s2);
                     
                     const p1 = r[idx]; const p2 = r[idx+1];
                     const w1 = p1 && p1 === bracketData.winner;
                     const w2 = p2 && p2 === bracketData.winner;
                     const s1 = s[idx]; const s2 = s[idx+1];
                     const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                     const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                     return (
                      <div key={idx} className="relative flex flex-col w-full max-w-[140px] mb-2">
                        <div className={`h-6 border-b-[1px] ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                            <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase truncate w-full text-left`}>
                                {seed1 ? <span className="text-base text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-base ml-1">{s1}</span>
                        </div>
                        <div className={`h-6 border-b-[1px] ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                            <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase truncate w-full text-left`}>
                                {seed2 ? <span className="text-base text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                            </span>
                            <span className="text-[#b35a38] font-black text-base ml-1">{s2}</span>
                        </div>
                      </div>
                     )
                  })}
                </div>

                {/* FINAL (Siempre) */}
                <div className="flex flex-col justify-center flex-1 items-center relative">
                    <Trophy className="w-16 h-16 text-orange-400 mb-2 mx-auto animate-bounce" />
                    <div className="flex flex-col items-center w-full">
                        <span className="text-[#b35a38]/70 font-black text-[10px] uppercase tracking-[0.2em] mb-1">CAMPEÓN</span>
                        <span className="text-[#b35a38] font-black text-2xl italic uppercase text-center w-full block drop-shadow-sm truncate">{bracketData.winner || ""}</span>
                    </div>
                </div>

              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-20 h-20 mb-4 opacity-50" />
                <h3 className="text-2xl font-black uppercase tracking-wider mb-2">Cuadro no definido aún</h3>
                
                {bracketData.canGenerate ? (
                    <div className="mt-4">
                        <p className="font-medium text-slate-500 mb-4">Se encontraron clasificados en el sistema.</p>
                        {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                           <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold px-8 shadow-lg">
                               <Shuffle className="mr-2 w-4 h-4" /> Sortear
                           </Button>
                        ) : (
                           <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold px-8 shadow-lg">
                               <Shuffle className="mr-2 w-4 h-4" /> Sortear
                           </Button>
                        )}
                    </div>
                ) : (
                    <p className="font-medium text-slate-500">Los cruces para este torneo estarán disponibles próximamente.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- MODAL DE RANKING --- */}
        {showRankingCalc && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[80vh] overflow-y-auto">
                    <Button onClick={() => setShowRankingCalc(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500" variant="ghost">
                        <X className="w-6 h-6" />
                    </Button>
                    
                    <div className="text-center mb-6">
                        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                        <h3 className="text-2xl font-black uppercase text-slate-800">Cálculo de Puntos</h3>
                        <p className="text-sm text-slate-500 font-medium">Torneo: {navState.tournamentShort}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#b35a38] text-white">
                                <tr>
                                    <th className="p-3 font-bold text-sm uppercase tracking-wider">Jugador</th>
                                    <th className="p-3 font-bold text-sm uppercase tracking-wider text-right">Puntos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {calculatedRanking.map((p, i) => (
                                    <tr key={i} className="hover:bg-white transition-colors">
                                        <td className="p-3 font-bold text-slate-700 uppercase text-sm">{p.name}</td>
                                        <td className="p-3 font-black text-orange-600 text-right">{p.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 flex gap-4">
                        <Button onClick={() => {
                            const text = calculatedRanking.map(p => `${p.name}\t${p.points}`).join('\n');
                            navigator.clipboard.writeText(text);
                            alert("Tabla copiada al portapapeles");
                        }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-12 rounded-xl">
                            <Copy className="mr-2 w-4 h-4" /> COPIAR TABLA
                        </Button>
                        
                        <Button onClick={() => {
                            let mensaje = `*RANKING CALCULADO - ${navState.tournamentShort}*\n\n`;
                            calculatedRanking.forEach(p => {
                                mensaje += `${p.name}: ${p.points}\n`;
                            });
                            window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
                        }} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl">
                            <Send className="mr-2 w-4 h-4" /> ENVIAR POR WHATSAPP
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {navState.level === "ranking-view" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center text-center">
            <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-white italic text-center">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-center">{navState.selectedCategory} {navState.year}</h2>
            </div>
            {headers.length > 0 && rankingData.length > 0 ? (
              <div className="overflow-x-auto text-center">
                <table className="w-full text-lg font-bold text-center">
                  <thead>
                    <tr className="bg-[#b35a38] text-white">
                      <th className="p-4 text-center font-black first:rounded-tl-xl text-center">POS</th>
                      <th className="p-4 text-center font-black text-center text-center">JUGADOR</th>
                      {headers.map((h, i) => (<th key={i} className="p-4 text-center font-black hidden sm:table-cell text-center">{h}</th>))}
                      <th className="p-4 text-center font-black bg-[#8c3d26] last:rounded-tr-xl text-center text-center">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, i) => (
                      <tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center text-center">
                        <td className="p-4 text-slate-400 text-center">{i + 1}</td>
                        <td className="p-4 uppercase text-slate-700 text-center">{p.name}</td>
                        {p.points.map((val: any, idx: number) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell text-center">{val || 0}</td>))}
                        <td className="p-4 text-[#b35a38] text-2xl font-black bg-[#fffaf5] text-center">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (<div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black animate-pulse text-center">Cargando datos...</div>)}
          </div>
        )}
      </div>
      {/* TRIGGER SECRETO DE RANKING EN EL FOOTER */}
      <p 
        onClick={handleFooterClick}
        className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center cursor-pointer select-none active:scale-95 transition-transform"
      >
        Sistema de seguimiento de torneos en vivo
      </p>
    </div>
  );
}