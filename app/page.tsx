"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

type NavigationLevel =
  | "home"
  | "main-menu"
  | "category-selection"
  | "tournament-selection"
  | "tournament-phases"
  | "group-phase"
  | "bracket-phase"
  | "ranking-view"

interface NavState {
  level: NavigationLevel
  type?: "caballeros" | "damas" | "ranking"
  category?: "A" | "B1" | "B2" | "C"
  selectedCategory?: string
  tournament?: string
  tournamentId?: string
}

const rankingDataByCategory = {
  "Categoría A": [
    {
      position: 1,
      name: "Martín Rodríguez",
      australianOpen: 150,
      indianWells: 120,
      monteCarlo: 180,
      rolandGarros: 200,
      wimbledon: 160,
      usOpen: 140,
    },
    {
      position: 2,
      name: "Santiago Fernández",
      australianOpen: 140,
      indianWells: 130,
      monteCarlo: 150,
      rolandGarros: 180,
      wimbledon: 170,
      usOpen: 130,
    },
    {
      position: 3,
      name: "Luciano González",
      australianOpen: 130,
      indianWells: 140,
      monteCarlo: 140,
      rolandGarros: 160,
      wimbledon: 150,
      usOpen: 150,
    },
    {
      position: 4,
      name: "Tomás Martínez",
      australianOpen: 120,
      indianWells: 110,
      monteCarlo: 160,
      rolandGarros: 150,
      wimbledon: 140,
      usOpen: 160,
    },
    {
      position: 5,
      name: "Franco López",
      australianOpen: 110,
      indianWells: 150,
      monteCarlo: 130,
      rolandGarros: 140,
      wimbledon: 130,
      usOpen: 140,
    },
    {
      position: 6,
      name: "Nicolás Díaz",
      australianOpen: 100,
      indianWells: 120,
      monteCarlo: 140,
      rolandGarros: 130,
      wimbledon: 140,
      usOpen: 120,
    },
    {
      position: 7,
      name: "Agustín Pérez",
      australianOpen: 95,
      indianWells: 110,
      monteCarlo: 120,
      rolandGarros: 125,
      wimbledon: 120,
      usOpen: 130,
    },
    {
      position: 8,
      name: "Facundo Sánchez",
      australianOpen: 90,
      indianWells: 100,
      monteCarlo: 110,
      rolandGarros: 120,
      wimbledon: 110,
      usOpen: 115,
    },
    {
      position: 9,
      name: "Matías Romero",
      australianOpen: 85,
      indianWells: 95,
      monteCarlo: 100,
      rolandGarros: 110,
      wimbledon: 105,
      usOpen: 110,
    },
    {
      position: 10,
      name: "Ignacio Torres",
      australianOpen: 80,
      indianWells: 90,
      monteCarlo: 95,
      rolandGarros: 105,
      wimbledon: 100,
      usOpen: 105,
    },
    {
      position: 11,
      name: "Bruno Morales",
      australianOpen: 75,
      indianWells: 85,
      monteCarlo: 90,
      rolandGarros: 100,
      wimbledon: 95,
      usOpen: 100,
    },
    {
      position: 12,
      name: "Maximiliano Castro",
      australianOpen: 70,
      indianWells: 80,
      monteCarlo: 85,
      rolandGarros: 95,
      wimbledon: 90,
      usOpen: 95,
    },
    {
      position: 13,
      name: "Valentín Ruiz",
      australianOpen: 65,
      indianWells: 75,
      monteCarlo: 80,
      rolandGarros: 90,
      wimbledon: 85,
      usOpen: 90,
    },
    {
      position: 14,
      name: "Joaquín Herrera",
      australianOpen: 60,
      indianWells: 70,
      monteCarlo: 75,
      rolandGarros: 85,
      wimbledon: 80,
      usOpen: 85,
    },
    {
      position: 15,
      name: "Emiliano Silva",
      australianOpen: 55,
      indianWells: 65,
      monteCarlo: 70,
      rolandGarros: 80,
      wimbledon: 75,
      usOpen: 80,
    },
  ],
  "Categoría B1": [
    {
      position: 1,
      name: "Diego Vargas",
      australianOpen: 180,
      indianWells: 150,
      monteCarlo: 140,
      rolandGarros: 200,
      wimbledon: 170,
      usOpen: 160,
    },
    {
      position: 2,
      name: "Sebastián Medina",
      australianOpen: 160,
      indianWells: 140,
      monteCarlo: 150,
      rolandGarros: 180,
      wimbledon: 160,
      usOpen: 150,
    },
    {
      position: 3,
      name: "Alejandro Ortiz",
      australianOpen: 150,
      indianWells: 130,
      monteCarlo: 160,
      rolandGarros: 170,
      wimbledon: 150,
      usOpen: 140,
    },
    {
      position: 4,
      name: "Pablo Navarro",
      australianOpen: 140,
      indianWells: 120,
      monteCarlo: 140,
      rolandGarros: 160,
      wimbledon: 140,
      usOpen: 130,
    },
    {
      position: 5,
      name: "Lucas Giménez",
      australianOpen: 130,
      indianWells: 110,
      monteCarlo: 130,
      rolandGarros: 150,
      wimbledon: 130,
      usOpen: 120,
    },
    {
      position: 6,
      name: "Rodrigo Vega",
      australianOpen: 120,
      indianWells: 100,
      monteCarlo: 120,
      rolandGarros: 140,
      wimbledon: 120,
      usOpen: 110,
    },
    {
      position: 7,
      name: "Gonzalo Ríos",
      australianOpen: 110,
      indianWells: 95,
      monteCarlo: 110,
      rolandGarros: 130,
      wimbledon: 110,
      usOpen: 100,
    },
    {
      position: 8,
      name: "Ezequiel Molina",
      australianOpen: 100,
      indianWells: 90,
      monteCarlo: 100,
      rolandGarros: 120,
      wimbledon: 100,
      usOpen: 95,
    },
    {
      position: 9,
      name: "Cristian Benítez",
      australianOpen: 95,
      indianWells: 85,
      monteCarlo: 95,
      rolandGarros: 110,
      wimbledon: 95,
      usOpen: 90,
    },
    {
      position: 10,
      name: "Mariano Acosta",
      australianOpen: 90,
      indianWells: 80,
      monteCarlo: 90,
      rolandGarros: 105,
      wimbledon: 90,
      usOpen: 85,
    },
    {
      position: 11,
      name: "Adrián Campos",
      australianOpen: 85,
      indianWells: 75,
      monteCarlo: 85,
      rolandGarros: 100,
      wimbledon: 85,
      usOpen: 80,
    },
    {
      position: 12,
      name: "Damián Rojas",
      australianOpen: 80,
      indianWells: 70,
      monteCarlo: 80,
      rolandGarros: 95,
      wimbledon: 80,
      usOpen: 75,
    },
    {
      position: 13,
      name: "Leandro Sosa",
      australianOpen: 75,
      indianWells: 65,
      monteCarlo: 75,
      rolandGarros: 90,
      wimbledon: 75,
      usOpen: 70,
    },
    {
      position: 14,
      name: "Gastón Flores",
      australianOpen: 70,
      indianWells: 60,
      monteCarlo: 70,
      rolandGarros: 85,
      wimbledon: 70,
      usOpen: 65,
    },
    {
      position: 15,
      name: "Mateo Paredes",
      australianOpen: 65,
      indianWells: 55,
      monteCarlo: 65,
      rolandGarros: 80,
      wimbledon: 65,
      usOpen: 60,
    },
  ],
  "Categoría B2": [
    {
      position: 1,
      name: "Julián Cabrera",
      australianOpen: 170,
      indianWells: 160,
      monteCarlo: 190,
      rolandGarros: 200,
      wimbledon: 180,
      usOpen: 175,
    },
    {
      position: 2,
      name: "Andrés Blanco",
      australianOpen: 165,
      indianWells: 155,
      monteCarlo: 175,
      rolandGarros: 190,
      wimbledon: 170,
      usOpen: 165,
    },
    {
      position: 3,
      name: "Raúl Cardozo",
      australianOpen: 155,
      indianWells: 145,
      monteCarlo: 165,
      rolandGarros: 180,
      wimbledon: 160,
      usOpen: 155,
    },
    {
      position: 4,
      name: "Claudio Ibarra",
      australianOpen: 145,
      indianWells: 135,
      monteCarlo: 155,
      rolandGarros: 170,
      wimbledon: 150,
      usOpen: 145,
    },
    {
      position: 5,
      name: "Ramiro Luna",
      australianOpen: 135,
      indianWells: 125,
      monteCarlo: 145,
      rolandGarros: 160,
      wimbledon: 140,
      usOpen: 135,
    },
    {
      position: 6,
      name: "Oscar Núñez",
      australianOpen: 125,
      indianWells: 115,
      monteCarlo: 135,
      rolandGarros: 150,
      wimbledon: 130,
      usOpen: 125,
    },
    {
      position: 7,
      name: "Emilio Paz",
      australianOpen: 115,
      indianWells: 105,
      monteCarlo: 125,
      rolandGarros: 140,
      wimbledon: 120,
      usOpen: 115,
    },
    {
      position: 8,
      name: "Sergio Quiroga",
      australianOpen: 105,
      indianWells: 95,
      monteCarlo: 115,
      rolandGarros: 130,
      wimbledon: 110,
      usOpen: 105,
    },
    {
      position: 9,
      name: "Alberto Ramos",
      australianOpen: 100,
      indianWells: 90,
      monteCarlo: 110,
      rolandGarros: 125,
      wimbledon: 105,
      usOpen: 100,
    },
    {
      position: 10,
      name: "Gustavo Suárez",
      australianOpen: 95,
      indianWells: 85,
      monteCarlo: 105,
      rolandGarros: 120,
      wimbledon: 100,
      usOpen: 95,
    },
    {
      position: 11,
      name: "Ricardo Vera",
      australianOpen: 90,
      indianWells: 80,
      monteCarlo: 100,
      rolandGarros: 115,
      wimbledon: 95,
      usOpen: 90,
    },
    {
      position: 12,
      name: "Leonardo Wolf",
      australianOpen: 85,
      indianWells: 75,
      monteCarlo: 95,
      rolandGarros: 110,
      wimbledon: 90,
      usOpen: 85,
    },
    {
      position: 13,
      name: "Hernán Yáñez",
      australianOpen: 80,
      indianWells: 70,
      monteCarlo: 90,
      rolandGarros: 105,
      wimbledon: 85,
      usOpen: 80,
    },
    {
      position: 14,
      name: "Gabriel Zárate",
      australianOpen: 75,
      indianWells: 65,
      monteCarlo: 85,
      rolandGarros: 100,
      wimbledon: 80,
      usOpen: 75,
    },
    {
      position: 15,
      name: "Fernando Alarcón",
      australianOpen: 70,
      indianWells: 60,
      monteCarlo: 80,
      rolandGarros: 95,
      wimbledon: 75,
      usOpen: 70,
    },
  ],
  "Categoría C": [
    {
      position: 1,
      name: "Esteban Bravo",
      australianOpen: 195,
      indianWells: 175,
      monteCarlo: 180,
      rolandGarros: 200,
      wimbledon: 185,
      usOpen: 190,
    },
    {
      position: 2,
      name: "Adrián Cruz",
      australianOpen: 180,
      indianWells: 165,
      monteCarlo: 170,
      rolandGarros: 190,
      wimbledon: 175,
      usOpen: 180,
    },
    {
      position: 3,
      name: "Marcelo Delgado",
      australianOpen: 170,
      indianWells: 155,
      monteCarlo: 160,
      rolandGarros: 180,
      wimbledon: 165,
      usOpen: 170,
    },
    {
      position: 4,
      name: "Darío Espinoza",
      australianOpen: 160,
      indianWells: 145,
      monteCarlo: 150,
      rolandGarros: 170,
      wimbledon: 155,
      usOpen: 160,
    },
    {
      position: 5,
      name: "Javier Figueroa",
      australianOpen: 150,
      indianWells: 135,
      monteCarlo: 140,
      rolandGarros: 160,
      wimbledon: 145,
      usOpen: 150,
    },
    {
      position: 6,
      name: "Miguel Guzmán",
      australianOpen: 140,
      indianWells: 125,
      monteCarlo: 130,
      rolandGarros: 150,
      wimbledon: 135,
      usOpen: 140,
    },
    {
      position: 7,
      name: "Hugo Hidalgo",
      australianOpen: 130,
      indianWells: 115,
      monteCarlo: 120,
      rolandGarros: 140,
      wimbledon: 125,
      usOpen: 130,
    },
    {
      position: 8,
      name: "Iván Iglesias",
      australianOpen: 120,
      indianWells: 105,
      monteCarlo: 110,
      rolandGarros: 130,
      wimbledon: 115,
      usOpen: 120,
    },
    {
      position: 9,
      name: "Jorge Juárez",
      australianOpen: 110,
      indianWells: 95,
      monteCarlo: 100,
      rolandGarros: 120,
      wimbledon: 105,
      usOpen: 110,
    },
    {
      position: 10,
      name: "Kevin Keller",
      australianOpen: 105,
      indianWells: 90,
      monteCarlo: 95,
      rolandGarros: 115,
      wimbledon: 100,
      usOpen: 105,
    },
    {
      position: 11,
      name: "Luis Lagos",
      australianOpen: 100,
      indianWells: 85,
      monteCarlo: 90,
      rolandGarros: 110,
      wimbledon: 95,
      usOpen: 100,
    },
    {
      position: 12,
      name: "Manuel Mendoza",
      australianOpen: 95,
      indianWells: 80,
      monteCarlo: 85,
      rolandGarros: 105,
      wimbledon: 90,
      usOpen: 95,
    },
    {
      position: 13,
      name: "Néstor Nieto",
      australianOpen: 90,
      indianWells: 75,
      monteCarlo: 80,
      rolandGarros: 100,
      wimbledon: 85,
      usOpen: 90,
    },
    {
      position: 14,
      name: "Omar Oliva",
      australianOpen: 85,
      indianWells: 70,
      monteCarlo: 75,
      rolandGarros: 95,
      wimbledon: 80,
      usOpen: 85,
    },
    {
      position: 15,
      name: "Pedro Ponce",
      australianOpen: 80,
      indianWells: 65,
      monteCarlo: 70,
      rolandGarros: 90,
      wimbledon: 75,
      usOpen: 80,
    },
  ],
}

const tournaments = [
  { id: "ao", name: "Australian Open", shortName: "AO" },
  { id: "iw", name: "Indian Wells", shortName: "IW" },
  { id: "mc", name: "Monte Carlo", shortName: "MC" },
  { id: "rg", name: "Roland Garros", shortName: "RG" },
  { id: "wimbledon", name: "Wimbledon", shortName: "W" },
  { id: "us", name: "US Open", shortName: "US" },
]

const mockGroupData = [
  {
    groupName: "Grupo 1",
    players: ["Martín Rodríguez", "Santiago Fernández", "Luciano González"],
    results: {
      "Martín Rodríguez-Santiago Fernández": "6-4, 6-3",
      "Martín Rodríguez-Luciano González": "7-5, 6-2",
      "Santiago Fernández-Luciano González": "6-3, 4-6, 7-6",
    },
  },
  {
    groupName: "Grupo 2",
    players: ["Tomás Martínez", "Franco López", "Nicolás Díaz"],
    results: {
      "Tomás Martínez-Franco López": "6-2, 6-4",
      "Tomás Martínez-Nicolás Díaz": "7-6, 6-3",
      "Franco López-Nicolás Díaz": "6-4, 6-4",
    },
  },
  {
    groupName: "Grupo 3",
    players: ["Agustín Pérez", "Facundo Sánchez", "Matías Romero"],
    results: {
      "Agustín Pérez-Facundo Sánchez": "6-3, 6-2",
      "Agustín Pérez-Matías Romero": "7-5, 6-4",
      "Facundo Sánchez-Matías Romero": "6-4, 3-6, 7-5",
    },
  },
  {
    groupName: "Grupo 4",
    players: ["Ignacio Torres", "Bruno Morales", "Maximiliano Castro"],
    results: {
      "Ignacio Torres-Bruno Morales": "6-2, 6-3",
      "Ignacio Torres-Maximiliano Castro": "7-6, 6-2",
      "Bruno Morales-Maximiliano Castro": "6-4, 6-1",
    },
  },
  {
    groupName: "Grupo 5",
    players: ["Valentín Ruiz", "Joaquín Herrera", "Emiliano Silva"],
    results: {
      "Valentín Ruiz-Joaquín Herrera": "6-3, 6-4",
      "Valentín Ruiz-Emiliano Silva": "7-5, 6-3",
      "Joaquín Herrera-Emiliano Silva": "6-2, 6-4",
    },
  },
  {
    groupName: "Grupo 6",
    players: ["Diego Vargas", "Sebastián Medina", "Alejandro Ortiz"],
    results: {
      "Diego Vargas-Sebastián Medina": "6-4, 6-2",
      "Diego Vargas-Alejandro Ortiz": "7-6, 6-4",
      "Sebastián Medina-Alejandro Ortiz": "6-3, 6-3",
    },
  },
  {
    groupName: "Grupo 7",
    players: ["Pablo Navarro", "Lucas Giménez", "Rodrigo Vega"],
    results: {
      "Pablo Navarro-Lucas Giménez": "6-2, 6-3",
      "Pablo Navarro-Rodrigo Vega": "7-5, 6-2",
      "Lucas Giménez-Rodrigo Vega": "6-4, 6-4",
    },
  },
  {
    groupName: "Grupo 8",
    players: ["Gonzalo Ríos", "Ezequiel Molina", "Cristian Benítez"],
    results: {
      "Gonzalo Ríos-Ezequiel Molina": "6-3, 6-2",
      "Gonzalo Ríos-Cristian Benítez": "7-6, 6-3",
      "Ezequiel Molina-Cristian Benítez": "6-2, 6-4",
    },
  },
  {
    groupName: "Grupo 9",
    players: ["Mariano Acosta", "Adrián Campos", "Damián Rojas"],
    results: {
      "Mariano Acosta-Adrián Campos": "6-4, 6-3",
      "Mariano Acosta-Damián Rojas": "7-5, 6-2",
      "Adrián Campos-Damián Rojas": "6-3, 6-4",
    },
  },
  {
    groupName: "Grupo 10",
    players: ["Leandro Sosa", "Gastón Flores", "Mateo Paredes"],
    results: {
      "Leandro Sosa-Gastón Flores": "6-2, 6-3",
      "Leandro Sosa-Mateo Paredes": "7-6, 6-4",
      "Gastón Flores-Mateo Paredes": "6-4, 6-2",
    },
  },
]

const mockBracketData = {
  leftSide: {
    roundOf16: [
      {
        player1: "Martín Rodríguez",
        score1: "3",
        player2: "Santiago Fernández",
        score2: "1",
        date: "Sábado 15 Dic.",
        time: "16:00 h.",
      },
      {
        player1: "Luciano González",
        score1: "2",
        player2: "Tomás Martínez",
        score2: "2",
        date: "Sábado 15 Dic.",
        time: "20:00 h.",
      },
      {
        player1: "Franco López",
        score1: "1",
        player2: "Nicolás Díaz",
        score2: "1",
        date: "Lunes 17 Dic.",
        time: "16:00 h.",
      },
      {
        player1: "Agustín Pérez",
        score1: "1",
        player2: "Facundo Sánchez",
        score2: "1",
        date: "Lunes 17 Dic.",
        time: "20:00 h.",
      },
    ],
    quarterFinals: [
      {
        player1: "Martín Rodríguez",
        score1: "2",
        player2: "TBD",
        score2: "",
        date: "Viernes 21 Dic.",
        time: "20:00 h.",
      },
      { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "Viernes 21 Dic.", time: "16:00 h." },
    ],
    semiFinal: { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "Martes 25 Dic.", time: "20:00 h." },
  },
  rightSide: {
    roundOf16: [
      {
        player1: "Matías Romero",
        score1: "3",
        player2: "Ignacio Torres",
        score2: "0",
        date: "Domingo 16 Dic.",
        time: "20:00 h.",
      },
      {
        player1: "Bruno Morales",
        score1: "3",
        player2: "Maximiliano Castro",
        score2: "1",
        date: "Domingo 16 Dic.",
        time: "16:00 h.",
      },
      {
        player1: "Valentín Ruiz",
        score1: "0",
        player2: "Joaquín Herrera",
        score2: "0",
        date: "Martes 18 Dic.",
        time: "16:00 h.",
      },
      {
        player1: "Emiliano Silva",
        score1: "1",
        player2: "Diego Vargas",
        score2: "1",
        date: "Martes 18 Dic.",
        time: "16:00 h.",
      },
    ],
    quarterFinals: [
      { player1: "Matías Romero", score1: "", player2: "TBD", score2: "", date: "Sábado 22 Dic.", time: "20:00 h." },
      { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "Sábado 22 Dic.", time: "16:00 h." },
    ],
    semiFinal: { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "Miércoles 26 Dic.", time: "20:00 h." },
  },
  final: { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "DOMINGO 30 DICIEMBRE", time: "18:00 h." },
  thirdPlace: { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "Sábado 29 Dic. 16:00 h." },
}

export default function Home() {
  const [navState, setNavState] = useState<NavState>({ level: "home" })

  const goBack = () => {
    if (navState.level === "main-menu") {
      setNavState({ level: "home" })
    } else if (navState.level === "category-selection") {
      setNavState({ level: "main-menu" })
    } else if (navState.level === "ranking-view") {
      setNavState({
        level: "category-selection",
        type: navState.type,
      })
    } else if (navState.level === "tournament-selection") {
      setNavState({
        level: "category-selection",
        type: navState.type,
      })
    } else if (navState.level === "tournament-phases") {
      setNavState({
        level: "tournament-selection",
        type: navState.type,
        category: navState.category,
        selectedCategory: navState.selectedCategory,
      })
    } else if (navState.level === "group-phase" || navState.level === "bracket-phase") {
      setNavState({
        level: "tournament-phases",
        type: navState.type,
        category: navState.category,
        selectedCategory: navState.selectedCategory,
        tournament: navState.tournament,
        tournamentId: navState.tournamentId,
      })
    }
  }

  const handleCategoryClick = (category: string) => {
    if (navState.type === "ranking") {
      setNavState({
        level: "ranking-view",
        type: "ranking",
        selectedCategory: category,
      })
    } else {
      setNavState({
        level: "tournament-selection",
        type: navState.type,
        category: category as "A" | "B1" | "B2" | "C",
        selectedCategory: category,
      })
    }
  }

  const handleTournamentClick = (tournament: { id: string; name: string }) => {
    setNavState({
      level: "tournament-phases",
      type: navState.type,
      category: navState.category,
      selectedCategory: navState.selectedCategory,
      tournament: tournament.name,
      tournamentId: tournament.id,
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex justify-center mb-5">
            <div className="relative group w-32 h-32 md:w-44 md:h-44">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="La Cautiva Tennis Club"
                  width={180}
                  height={180}
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            La Cautiva
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">Club de Tenis</p>
        </div>

        {/* Back Button */}
        {navState.level !== "home" && (
          <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <Button onClick={goBack} variant="ghost" className="hover:bg-secondary/20 transition-all duration-300">
              ← Volver
            </Button>
          </div>
        )}

        {/* Navigation Content */}
        <div className="space-y-4">
          {/* Home Level */}
          {navState.level === "home" && (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Button
                size="lg"
                onClick={() => setNavState({ level: "main-menu" })}
                className="w-full max-w-md text-xl h-24 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold"
              >
                <ChevronRight className="w-8 h-8 mr-3" />
                Ingresar
              </Button>
            </div>
          )}

          {/* Main Menu Level */}
          {navState.level === "main-menu" && (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setNavState({ level: "category-selection", type: "caballeros" })}
                className="w-full text-lg h-20 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Caballeros
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setNavState({ level: "category-selection", type: "damas" })}
                className="w-full text-lg h-20 border-2 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Damas
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setNavState({ level: "category-selection", type: "ranking" })}
                className="w-full text-lg h-20 border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Trophy className="w-6 h-6 mr-3" />
                Ranking
              </Button>
            </div>
          )}

          {/* Category Selection Level */}
          {navState.level === "category-selection" && (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground capitalize">
                {navState.type === "ranking" ? "Seleccionar Ranking" : navState.type}
              </h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((category) => (
                <Button
                  key={category}
                  size="lg"
                  variant="outline"
                  onClick={() => handleCategoryClick(category)}
                  className="w-full text-lg h-16 border-2 hover:bg-primary/10 hover:border-primary transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Tournament Selection Level */}
          {navState.level === "tournament-selection" && (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">
                {navState.selectedCategory}
              </h2>
              <p className="text-center text-muted-foreground mb-4 capitalize">{navState.type} - Seleccionar Torneo</p>
              {tournaments.map((tournament) => (
                <Button
                  key={tournament.id}
                  size="lg"
                  variant="outline"
                  onClick={() => handleTournamentClick(tournament)}
                  className="w-full text-lg h-16 border-2 hover:bg-secondary/10 hover:border-secondary transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  {tournament.name}
                </Button>
              ))}
            </div>
          )}

          {/* Tournament Phases Level */}
          {navState.level === "tournament-phases" && (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">{navState.tournament}</h2>
              <p className="text-center text-muted-foreground mb-4">{navState.selectedCategory}</p>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  setNavState({
                    level: "group-phase",
                    category: navState.category,
                    type: navState.type,
                    selectedCategory: navState.selectedCategory,
                    tournament: navState.tournament,
                  })
                }
                className="w-full text-lg h-20 border-2 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Users className="w-6 h-6 mr-3" />
                Fase de Grupos
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  setNavState({
                    level: "bracket-phase",
                    category: navState.category,
                    type: navState.type,
                    selectedCategory: navState.selectedCategory,
                    tournament: navState.tournament,
                  })
                }
                className="w-full text-lg h-20 border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transform hover:scale-105 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Grid3x3 className="w-6 h-6 mr-3" />
                Cuadro de Eliminación
              </Button>
            </div>
          )}

          {/* Group Phase Level */}
          {navState.level === "group-phase" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{navState.tournament}</h2>
                <p className="text-muted-foreground mt-2">{navState.selectedCategory} - Fase de Grupos</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockGroupData.map((group) => (
                  <div
                    key={group.groupName}
                    className="bg-gradient-to-br from-card to-muted/20 border-2 border-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold mb-4 text-primary text-center">{group.groupName}</h3>
                    <div className="bg-card rounded-lg overflow-auto border border-border">
                      <table className="w-full text-xs md:text-sm border-collapse">
                        <thead className="bg-primary/10">
                          <tr>
                            <th className="p-2 border border-border font-semibold text-left min-w-[120px]">Jugador</th>
                            {group.players.map((player) => (
                              <th
                                key={player}
                                className="p-2 border border-border font-semibold text-center min-w-[80px]"
                              >
                                {player.split(" ")[1]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.players.map((rowPlayer, rowIdx) => (
                            <tr key={rowPlayer} className="hover:bg-accent/5 transition-colors">
                              <td className="p-2 border border-border font-medium bg-primary/5">{rowPlayer}</td>
                              {group.players.map((colPlayer, colIdx) => {
                                if (rowIdx === colIdx) {
                                  return (
                                    <td key={colPlayer} className="p-2 border border-border text-center bg-muted/30">
                                      -
                                    </td>
                                  )
                                }
                                const matchKey = `${rowPlayer}-${colPlayer}`
                                const reverseMatchKey = `${colPlayer}-${rowPlayer}`
                                const results = group.results as unknown as Record<string, string>
                                const result = results[matchKey] || results[reverseMatchKey] || "-"
                                return (
                                  <td
                                    key={colPlayer}
                                    className="p-2 border border-border text-center text-muted-foreground text-xs"
                                  >
                                    {result}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                          <tr className="bg-accent/10 font-semibold">
                            <td className="p-2 border border-border">Posición</td>
                            <td className="p-2 border border-border text-center">1</td>
                            <td className="p-2 border border-border text-center">2</td>
                            <td className="p-2 border border-border text-center">3</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bracket Phase Level */}
          {navState.level === "bracket-phase" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{navState.tournament}</h2>
                <p className="text-muted-foreground mt-2">{navState.selectedCategory} - Cuadro de Eliminación</p>
              </div>

              <div className="lg:hidden space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary text-center">OCTAVOS</h3>
                  <div className="space-y-3">
                    {[...mockBracketData.leftSide.roundOf16, ...mockBracketData.rightSide.roundOf16].map(
                      (match, idx) => (
                        <div key={idx} className="bg-card border-2 border-border rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-2">
                            {match.date} - {match.time}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-semibold">{match.player1}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold">
                                {match.score1 || "-"}
                              </div>
                              <span className="text-muted-foreground">vs</span>
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold">
                                {match.score2 || "-"}
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="font-semibold">{match.player2}</div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary text-center">CUARTOS DE FINAL</h3>
                  <div className="space-y-3">
                    {[...mockBracketData.leftSide.quarterFinals, ...mockBracketData.rightSide.quarterFinals].map(
                      (match, idx) => (
                        <div key={idx} className="bg-card border-2 border-secondary/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-2">
                            {match.date} - {match.time}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-semibold">{match.player1}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded flex items-center justify-center font-bold">
                                {match.score1 || "-"}
                              </div>
                              <span className="text-muted-foreground">vs</span>
                              <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded flex items-center justify-center font-bold">
                                {match.score2 || "-"}
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="font-semibold">{match.player2}</div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary text-center">SEMIFINALES</h3>
                  <div className="space-y-3">
                    {[mockBracketData.leftSide.semiFinal, mockBracketData.rightSide.semiFinal].map((match, idx) => (
                      <div key={idx} className="bg-card border-2 border-accent/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-2">
                          {match.date} - {match.time}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-semibold">{match.player1}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <div className="w-8 h-8 bg-accent text-accent-foreground rounded flex items-center justify-center font-bold">
                              {match.score1 || "-"}
                            </div>
                            <span className="text-muted-foreground">vs</span>
                            <div className="w-8 h-8 bg-accent text-accent-foreground rounded flex items-center justify-center font-bold">
                              {match.score2 || "-"}
                            </div>
                          </div>
                          <div className="flex-1 text-right">
                            <div className="font-semibold">{match.player2}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-bold mb-4 text-primary text-center">FINAL</h3>
                  <div className="bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Trophy className="w-8 h-8 text-primary" />
                      <span className="text-lg font-bold text-primary">{mockBracketData.final.date}</span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground mb-4">{mockBracketData.final.time}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-bold text-center">{mockBracketData.final.player1}</div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
                          {mockBracketData.final.score1 || "-"}
                        </div>
                        <span className="font-bold">vs</span>
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
                          {mockBracketData.final.score2 || "-"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-center">{mockBracketData.final.player2}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    3er y 4to Puesto: {mockBracketData.thirdPlace.date}
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  {/* Grid principal */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-8">
                    {/* Lado izquierdo */}
                    <div className="space-y-12">
                      {/* Octavos izquierda */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground">OCTAVOS</h3>
                        <div className="space-y-6">
                          {mockBracketData.leftSide.roundOf16.map((match, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-xs text-muted-foreground mb-1">
                                {match.date} {match.time}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-card border border-border rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  {match.player1}
                                  <span className="ml-2 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score1}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-card border border-border rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  {match.player2}
                                  <span className="ml-2 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score2}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cuartos izquierda */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground">CUARTOS</h3>
                        <div className="space-y-8">
                          {mockBracketData.leftSide.quarterFinals.map((match, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-xs text-muted-foreground mb-1">
                                {match.date} {match.time}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-card border-2 border-secondary/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  {match.player1}
                                  <span className="ml-2 w-6 h-6 bg-secondary text-secondary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score1 || "-"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-card border-2 border-secondary/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  {match.player2}
                                  <span className="ml-2 w-6 h-6 bg-secondary text-secondary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score2 || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Semifinal izquierda */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground">SEMIFINAL</h3>
                        <div className="text-sm">
                          <div className="text-xs text-muted-foreground mb-1">
                            {mockBracketData.leftSide.semiFinal.date} {mockBracketData.leftSide.semiFinal.time}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-card border-2 border-accent/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                              {mockBracketData.leftSide.semiFinal.player1}
                              <span className="ml-2 w-6 h-6 bg-accent text-accent-foreground rounded flex items-center justify-center text-xs font-bold">
                                {mockBracketData.leftSide.semiFinal.score1 || "-"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-card border-2 border-accent/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                              {mockBracketData.leftSide.semiFinal.player2}
                              <span className="ml-2 w-6 h-6 bg-accent text-accent-foreground rounded flex items-center justify-center text-xs font-bold">
                                {mockBracketData.leftSide.semiFinal.score2 || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Centro - FASE FINAL */}
                    <div className="flex flex-col items-center justify-center min-w-[280px]">
                      <div className="bg-gradient-to-b from-primary/20 via-accent/20 to-secondary/20 border-4 border-primary rounded-2xl p-6 shadow-2xl">
                        <div className="text-center mb-6">
                          <Trophy className="w-12 h-12 text-primary mx-auto mb-2" />
                          <h3 className="text-2xl font-bold text-primary">FASE FINAL</h3>
                        </div>

                        {/* Final */}
                        <div className="mb-6 bg-card/50 rounded-xl p-4 border-2 border-primary">
                          <div className="text-center mb-3">
                            <div className="font-bold text-lg">FINAL</div>
                            <div className="text-xs text-muted-foreground">{mockBracketData.final.date}</div>
                            <div className="text-xs text-muted-foreground">{mockBracketData.final.time}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-card border-2 border-primary rounded px-3 py-3 font-bold text-center flex items-center justify-between">
                              {mockBracketData.final.player1}
                              <span className="ml-2 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                                {mockBracketData.final.score1 || "-"}
                              </span>
                            </div>
                            <div className="bg-card border-2 border-primary rounded px-3 py-3 font-bold text-center flex items-center justify-between">
                              {mockBracketData.final.player2}
                              <span className="ml-2 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                                {mockBracketData.final.score2 || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3er puesto */}
                        <div className="bg-muted/50 rounded-lg p-3 text-center text-sm">
                          <div className="font-semibold mb-1">3er y 4to PUESTO</div>
                          <div className="text-xs text-muted-foreground">{mockBracketData.thirdPlace.date}</div>
                        </div>
                      </div>
                    </div>

                    {/* Lado derecho */}
                    <div className="space-y-12">
                      {/* Octavos derecha */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground text-right">OCTAVOS</h3>
                        <div className="space-y-6">
                          {mockBracketData.rightSide.roundOf16.map((match, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-xs text-muted-foreground mb-1 text-right">
                                {match.date} {match.time}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-card border border-border rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  <span className="mr-2 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score1}
                                  </span>
                                  {match.player1}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-card border border-border rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  <span className="mr-2 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score2}
                                  </span>
                                  {match.player2}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cuartos derecha */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground text-right">CUARTOS</h3>
                        <div className="space-y-8">
                          {mockBracketData.rightSide.quarterFinals.map((match, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-xs text-muted-foreground mb-1 text-right">
                                {match.date} {match.time}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-card border-2 border-secondary/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  <span className="mr-2 w-6 h-6 bg-secondary text-secondary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score1 || "-"}
                                  </span>
                                  {match.player1}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-card border-2 border-secondary/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                                  <span className="mr-2 w-6 h-6 bg-secondary text-secondary-foreground rounded flex items-center justify-center text-xs font-bold">
                                    {match.score2 || "-"}
                                  </span>
                                  {match.player2}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Semifinal derecha */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground text-right">SEMIFINAL</h3>
                        <div className="text-sm">
                          <div className="text-xs text-muted-foreground mb-1 text-right">
                            {mockBracketData.rightSide.semiFinal.date} {mockBracketData.rightSide.semiFinal.time}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-card border-2 border-accent/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                              <span className="mr-2 w-6 h-6 bg-accent text-accent-foreground rounded flex items-center justify-center text-xs font-bold">
                                {mockBracketData.rightSide.semiFinal.score1 || "-"}
                              </span>
                              {mockBracketData.rightSide.semiFinal.player1}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-card border-2 border-accent/50 rounded px-3 py-2 font-semibold flex items-center justify-between">
                              <span className="mr-2 w-6 h-6 bg-accent text-accent-foreground rounded flex items-center justify-center text-xs font-bold">
                                {mockBracketData.rightSide.semiFinal.score2 || "-"}
                              </span>
                              {mockBracketData.rightSide.semiFinal.player2}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ranking View */}
          {navState.level === "ranking-view" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-foreground">
                {navState.selectedCategory}
              </h2>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full bg-card rounded-xl overflow-hidden shadow-lg border-2 border-border">
                  <thead className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <tr>
                      <th className="p-4 text-left font-bold">Pos</th>
                      <th className="p-4 text-left font-bold">Nombre Completo</th>
                      <th className="p-4 text-center font-bold">AO</th>
                      <th className="p-4 text-center font-bold">IW</th>
                      <th className="p-4 text-center font-bold">MC</th>
                      <th className="p-4 text-center font-bold">RG</th>
                      <th className="p-4 text-center font-bold">W</th>
                      <th className="p-4 text-center font-bold">US</th>
                      <th className="p-4 text-center font-bold bg-primary/20">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingDataByCategory[navState.selectedCategory as keyof typeof rankingDataByCategory].map(
                      (player, idx) => (
                        <tr
                          key={player.position}
                          className={`border-t-2 border-border hover:bg-accent/10 transition-all duration-300 ${
                            idx < 3 ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="p-4 font-bold text-lg">
                            {player.position <= 3 ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                                {player.position}
                              </span>
                            ) : (
                              player.position
                            )}
                          </td>
                          <td className="p-4 font-semibold text-foreground">{player.name}</td>
                          <td className="p-4 text-center text-muted-foreground">{player.australianOpen}</td>
                          <td className="p-4 text-center text-muted-foreground">{player.indianWells}</td>
                          <td className="p-4 text-center text-muted-foreground">{player.monteCarlo}</td>
                          <td className="p-4 text-center text-muted-foreground">{player.rolandGarros}</td>
                          <td className="p-4 text-center text-muted-foreground">{player.wimbledon}</td>
                          <td className="p-4 text-center text-muted-foreground">{player.usOpen}</td>
                          <td className="p-4 text-center font-bold text-lg text-primary bg-accent/5">
                            {player.australianOpen +
                              player.indianWells +
                              player.monteCarlo +
                              player.rolandGarros +
                              player.wimbledon +
                              player.usOpen}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {rankingDataByCategory[navState.selectedCategory as keyof typeof rankingDataByCategory].map(
                  (player, idx) => (
                    <div
                      key={player.position}
                      className={`bg-gradient-to-br from-card to-muted/20 border-2 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        idx < 3 ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {player.position <= 3 ? (
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg">
                              {player.position}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted text-foreground font-bold text-lg">
                              {player.position}
                            </span>
                          )}
                          <div className="font-bold text-lg text-foreground">{player.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground font-semibold">Total</div>
                          <div className="text-2xl font-bold text-primary">
                            {player.australianOpen +
                              player.indianWells +
                              player.monteCarlo +
                              player.rolandGarros +
                              player.wimbledon +
                              player.usOpen}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card rounded-lg p-3 text-center border border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">AO</div>
                          <div className="text-lg font-bold text-foreground">{player.australianOpen}</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center border border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">IW</div>
                          <div className="text-lg font-bold text-foreground">{player.indianWells}</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center border border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">MC</div>
                          <div className="text-lg font-bold text-foreground">{player.monteCarlo}</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center border border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">RG</div>
                          <div className="text-lg font-bold text-foreground">{player.rolandGarros}</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center border border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">W</div>
                          <div className="text-lg font-bold text-foreground">{player.wimbledon}</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center border border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">US</div>
                          <div className="text-lg font-bold text-foreground">{player.usOpen}</div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm md:text-base text-muted-foreground mt-8 font-medium">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}
