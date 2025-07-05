import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  course: text("course").notNull(),
  location: text("location"),
  totalRounds: integer("total_rounds").notNull().default(2),
  currentRound: integer("current_round").notNull().default(1),
  coursePar: integer("course_par").notNull().default(72),
  isActive: boolean("is_active").notNull().default(true),
  courseConfiguration: json("course_configuration"), // Store hole pars, yardages, etc.
  tournamentType: text("tournament_type").default("stroke_play"), // stroke_play, match_play, scramble
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  handicap: integer("handicap").notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  roundNumber: integer("round_number").notNull(),
  courseName: text("course_name").notNull(),
  grossScore: integer("gross_score"),
  netScore: integer("net_score"),
  isComplete: boolean("is_complete").notNull().default(false),
  isStarted: boolean("is_started").notNull().default(false),
  currentHole: integer("current_hole").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  roundId: integer("round_id").references(() => rounds.id),
  hole: integer("hole").notNull(),
  strokes: integer("strokes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Player Statistics Table
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  roundId: integer("round_id").references(() => rounds.id),
  
  // Scoring Statistics
  totalStrokes: integer("total_strokes").notNull(),
  totalPutts: integer("total_putts"),
  fairwaysHit: integer("fairways_hit"),
  fairwaysTotal: integer("fairways_total"),
  greensInRegulation: integer("greens_in_regulation"),
  greensTotal: integer("greens_total"),
  scrambling: integer("scrambling"), // Up and down saves
  scramblingAttempts: integer("scrambling_attempts"),
  
  // Score Distribution
  eagles: integer("eagles").default(0),
  birdies: integer("birdies").default(0),
  pars: integer("pars").default(0),
  bogeys: integer("bogeys").default(0),
  doubleBogeys: integer("double_bogeys").default(0),
  tripleBogeys: integer("triple_bogeys").default(0),
  worseThanTriple: integer("worse_than_triple").default(0),
  
  // Distance and Accuracy
  averageDriveDistance: integer("average_drive_distance"), // yards
  drivingAccuracy: integer("driving_accuracy"), // percentage
  
  // Course-specific performance
  courseName: text("course_name").notNull(),
  courseRating: integer("course_rating"), // Player's rating of course difficulty (1-10)
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Course Statistics Table
export const courseStats = pgTable("course_stats", {
  id: serial("id").primaryKey(),
  courseName: text("course_name").notNull(),
  location: text("location"),
  
  // Aggregate statistics from all rounds played
  totalRoundsPlayed: integer("total_rounds_played").default(0),
  averageScore: integer("average_score"), // Average score across all players
  lowestScore: integer("lowest_score"),
  highestScore: integer("highest_score"),
  
  // Course difficulty metrics
  difficultyRating: integer("difficulty_rating"), // 1-10 scale based on scores vs par
  averageScoreToPar: integer("average_score_to_par"), // How many strokes over/under par on average
  
  // Hole-specific data
  holeStats: json("hole_stats"), // Array of per-hole statistics
  
  // Weather and conditions impact
  weatherConditions: json("weather_conditions"), // Historical weather data
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Player Career Statistics (lifetime totals)
export const playerCareerStats = pgTable("player_career_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  
  // Career Totals
  totalRounds: integer("total_rounds").default(0),
  totalTournaments: integer("total_tournaments").default(0),
  totalStrokes: integer("total_strokes").default(0),
  
  // Best Performances
  bestRound: integer("best_round"),
  bestTournament: integer("best_tournament"),
  lowestHandicap: integer("lowest_handicap"),
  
  // Scoring Averages
  strokeAverage: integer("stroke_average"), // Stored as integer (multiply by 100 for decimals)
  currentHandicap: integer("current_handicap"),
  handicapTrend: text("handicap_trend"), // "improving", "stable", "declining"
  
  // Career Achievements
  holesInOne: integer("holes_in_one").default(0),
  totalEagles: integer("total_eagles").default(0),
  totalBirdies: integer("total_birdies").default(0),
  
  // Streaks and Records
  longestParStreak: integer("longest_par_streak").default(0),
  currentParStreak: integer("current_par_streak").default(0),
  bestStreak: json("best_streak"), // Details about best scoring streak
  
  // Favorite Courses
  favoriteCourses: json("favorite_courses"), // Array of course names with play counts
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tournament History for trending analysis
export const tournamentHistory = pgTable("tournament_history", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  
  // Tournament Performance
  finalPosition: integer("final_position"),
  totalStrokes: integer("total_strokes"),
  strokesUnderPar: integer("strokes_under_par"),
  
  // Round-by-round scores
  roundScores: json("round_scores"), // Array of round scores
  
  // Performance metrics
  bestRound: integer("best_round"),
  worstRound: integer("worst_round"),
  consistency: integer("consistency"), // Standard deviation of round scores
  
  // Course-specific achievement
  courseRecord: boolean("course_record").default(false),
  personalBest: boolean("personal_best").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertRoundSchema = createInsertSchema(rounds).omit({
  id: true,
  createdAt: true,
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  createdAt: true,
});

export const insertCourseStatsSchema = createInsertSchema(courseStats).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertPlayerCareerStatsSchema = createInsertSchema(playerCareerStats).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertTournamentHistorySchema = createInsertSchema(tournamentHistory).omit({
  id: true,
  createdAt: true,
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Round = typeof rounds.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;

export type CourseStats = typeof courseStats.$inferSelect;
export type InsertCourseStats = z.infer<typeof insertCourseStatsSchema>;

export type PlayerCareerStats = typeof playerCareerStats.$inferSelect;
export type InsertPlayerCareerStats = z.infer<typeof insertPlayerCareerStatsSchema>;

export type TournamentHistory = typeof tournamentHistory.$inferSelect;
export type InsertTournamentHistory = z.infer<typeof insertTournamentHistorySchema>;

export type PlayerWithScores = Player & {
  rounds: (Round & {
    scores: Score[];
  })[];
  totalGross: number;
  totalNet: number;
  toPar: number;
  position: number;
  status: string;
};

export type SkinResult = {
  hole: number;
  par: number;
  winners: {
    playerId: number;
    playerName: string;
    grossScore: number;
    netScore: number;
    winType: 'gross' | 'net';
  }[];
  carryOver: number;
  prizeAmount: number;
};

export type SkinsGame = {
  tournamentId: number;
  roundNumber: number;
  courseName: string;
  totalPrize: number;
  prizePerHole: number;
  results: SkinResult[];
  totalPaid: number;
  carryOverAmount: number;
};

export type StablefordHole = {
  hole: number;
  par: number;
  playerScores: {
    playerId: number;
    playerName: string;
    grossScore: number;
    netScore: number;
    stablefordPoints: number;
    modifiedStablefordPoints: number;
    result: string; // e.g., "Eagle", "Birdie", "Par", "Bogey", etc.
  }[];
};

export type StablefordResult = {
  tournamentId: number;
  roundNumber: number;
  courseName: string;
  system: 'stableford' | 'modified-stableford';
  holes: StablefordHole[];
  playerTotals: {
    playerId: number;
    playerName: string;
    handicap: number;
    totalPoints: number;
    totalGross: number;
    totalNet: number;
    position: number;
  }[];
};

export type GPSCoordinate = {
  latitude: number;
  longitude: number;
};

export type HoleGPSData = {
  hole: number;
  par: number;
  teeBoxes: {
    name: string; // e.g., "Black Tees", "Blue Tees", "White Tees", "Red Tees"
    coordinates: GPSCoordinate;
    yardage: number;
  }[];
  pin: GPSCoordinate;
  hazards: {
    type: 'water' | 'sand' | 'trees' | 'rough';
    name: string;
    coordinates: GPSCoordinate;
  }[];
  landmarks: {
    type: 'fairway' | 'green' | 'cart_path' | 'clubhouse';
    name: string;
    coordinates: GPSCoordinate;
  }[];
};

export type DistanceCalculation = {
  hole: number;
  playerLocation: GPSCoordinate;
  distanceToPin: number;
  distanceToTees: {
    name: string;
    distance: number;
  }[];
  nearbyHazards: {
    type: string;
    name: string;
    distance: number;
  }[];
  nearbyLandmarks: {
    type: string;
    name: string;
    distance: number;
  }[];
};
