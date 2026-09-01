// Types for the Jolpica-F1 API (Ergast-compatible schema).
// https://api.jolpi.ca/ergast/f1/

export interface Driver {
  driverId: string
  permanentNumber?: string
  code?: string
  url: string
  givenName: string
  familyName: string
  dateOfBirth: string
  nationality: string
}

export interface Constructor {
  constructorId: string
  url: string
  name: string
  nationality: string
}

export interface Circuit {
  circuitId: string
  url: string
  circuitName: string
  Location: {
    lat: string
    long: string
    locality: string
    country: string
  }
}

export interface SessionTime {
  date: string
  time: string
}

export interface Race {
  season: string
  round: string
  url: string
  raceName: string
  Circuit: Circuit
  date: string
  time?: string
  FirstPractice?: SessionTime
  SecondPractice?: SessionTime
  ThirdPractice?: SessionTime
  Qualifying?: SessionTime
  Sprint?: SessionTime
}

export interface DriverStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Driver: Driver
  Constructors: Constructor[]
}

export interface ConstructorStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Constructor: Constructor
}

export interface RaceResult {
  number: string
  position: string
  positionText: string
  points: string
  Driver: Driver
  Constructor: Constructor
  grid: string
  laps: string
  status: string
  Time?: {
    millis: string
    time: string
  }
  FastestLap?: {
    rank: string
    lap: string
    Time: { time: string }
    AverageSpeed: { units: string; speed: string }
  }
}

export interface QualifyingResult {
  number: string
  position: string
  Driver: Driver
  Constructor: Constructor
  Q1?: string
  Q2?: string
  Q3?: string
}

interface MRDataBase {
  xmlns: string
  series: string
  url: string
  limit: string
  offset: string
  total: string
}

export interface DriverStandingsResponse extends MRDataBase {
  StandingsTable: {
    season: string
    round: string
    StandingsLists: {
      season: string
      round: string
      DriverStandings: DriverStanding[]
    }[]
  }
}

export interface ConstructorStandingsResponse extends MRDataBase {
  StandingsTable: {
    season: string
    round: string
    StandingsLists: {
      season: string
      round: string
      ConstructorStandings: ConstructorStanding[]
    }[]
  }
}

export interface ScheduleResponse extends MRDataBase {
  RaceTable: {
    season: string
    Races: Race[]
  }
}

export interface RaceResultsResponse extends MRDataBase {
  RaceTable: {
    season: string
    round: string
    Races: (Race & { Results: RaceResult[] })[]
  }
}

export interface SprintResponse extends MRDataBase {
  RaceTable: {
    season: string
    Races: (Race & { SprintResults: RaceResult[] })[]
  }
}

export interface QualifyingResponse extends MRDataBase {
  RaceTable: {
    season: string
    round: string
    Races: (Race & { QualifyingResults: QualifyingResult[] })[]
  }
}
