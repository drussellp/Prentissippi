import { 
  tournaments, 
  players, 
  rounds, 
  scores,
  type Tournament,
  type Player,
  type Round,
  type Score,
  type InsertTournament,
  type InsertPlayer,
  type InsertRound,
  type InsertScore,
  type PlayerWithScores,
  type SkinResult,
  type SkinsGame,
  type StablefordResult,
  type HoleGPSData,
  type DistanceCalculation,
  type GPSCoordinate,
  type PlayerStats,
  type InsertPlayerStats,
  type PlayerCareerStats,
  type InsertPlayerCareerStats,
  type TournamentHistory,
  type InsertTournamentHistory,
  type CourseStats,
  type InsertCourseStats
} from "@shared/schema";

export interface IStorage {
  // Tournament operations
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournament(id: number): Promise<Tournament | undefined>;
  getActiveTournament(): Promise<Tournament | undefined>;
  updateTournament(id: number, updates: Partial<Tournament>): Promise<Tournament | undefined>;

  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByTournament(tournamentId: number): Promise<Player[]>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;

  // Round operations
  createRound(round: InsertRound): Promise<Round>;
  getRound(id: number): Promise<Round | undefined>;
  getRoundsByPlayer(playerId: number): Promise<Round[]>;
  updateRound(id: number, updates: Partial<Round>): Promise<Round | undefined>;

  // Score operations
  createScore(score: InsertScore): Promise<Score>;
  getScore(id: number): Promise<Score | undefined>;
  getScoresByRound(roundId: number): Promise<Score[]>;
  updateScore(id: number, updates: Partial<Score>): Promise<Score | undefined>;

  // Leaderboard operations
  getLeaderboard(tournamentId: number): Promise<PlayerWithScores[]>;

  // Skins operations
  calculateSkins(tournamentId: number, roundNumber: number, totalPrize: number): Promise<SkinsGame>;

  // Stableford operations
  calculateStableford(tournamentId: number, roundNumber: number, system: 'stableford' | 'modified-stableford'): Promise<StablefordResult>;

  // GPS operations
  getHoleGPSData(courseName: string, hole: number): Promise<HoleGPSData | undefined>;
  calculateDistances(courseName: string, hole: number, playerLocation: GPSCoordinate): Promise<DistanceCalculation>;

  // Statistics operations
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  getPlayerStats(playerId: number, timeRange?: string): Promise<PlayerStats[]>;
  updatePlayerCareerStats(playerId: number, stats: Partial<PlayerCareerStats>): Promise<PlayerCareerStats>;
  getPlayerCareerStats(playerId: number): Promise<PlayerCareerStats | undefined>;
  createTournamentHistory(history: InsertTournamentHistory): Promise<TournamentHistory>;
  getTournamentHistory(playerId: number, timeRange?: string): Promise<TournamentHistory[]>;
  updateCourseStats(courseName: string, stats: Partial<CourseStats>): Promise<CourseStats>;
  getCourseStats(courseName?: string): Promise<CourseStats[]>;
  calculateStatistics(playerId: number, roundId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private tournaments: Map<number, Tournament> = new Map();
  private players: Map<number, Player> = new Map();
  private rounds: Map<number, Round> = new Map();
  private scores: Map<number, Score> = new Map();
  private courseGPSData: Map<string, HoleGPSData[]> = new Map();
  private playerStats: Map<number, PlayerStats> = new Map();
  private playerCareerStats: Map<number, PlayerCareerStats> = new Map();
  private tournamentHistory: Map<number, TournamentHistory> = new Map();
  private courseStats: Map<string, CourseStats> = new Map();
  private currentTournamentId = 1;
  private currentPlayerId = 1;
  private currentRoundId = 1;
  private currentScoreId = 1;
  private currentPlayerStatsId = 1;
  private currentTournamentHistoryId = 1;

  constructor() {
    // Initialize with Dancing Rabbit Golf Club tournament
    this.createTournament({
      name: "Prentissippi",
      startDate: new Date("2025-07-05"),
      endDate: new Date("2025-07-06"),
      course: "Dancing Rabbit Golf Club",
      totalRounds: 2,
      currentRound: 1,
      coursePar: 72,
      isActive: true,
    });
    this.initializeGPSData();
  }

  private initializeGPSData() {
    // GPS data for Dancing Rabbit Golf Club - Azaleas Course
    const azaleasGPS: HoleGPSData[] = [
      {
        hole: 1,
        par: 4,
        teeBoxes: [
          { name: "Black Tees", coordinates: { latitude: 33.2345, longitude: -89.1234 }, yardage: 420 },
          { name: "Blue Tees", coordinates: { latitude: 33.2346, longitude: -89.1235 }, yardage: 390 },
          { name: "White Tees", coordinates: { latitude: 33.2347, longitude: -89.1236 }, yardage: 360 },
          { name: "Red Tees", coordinates: { latitude: 33.2348, longitude: -89.1237 }, yardage: 310 }
        ],
        pin: { latitude: 33.2360, longitude: -89.1250 },
        hazards: [
          { type: 'water', name: 'Creek crossing fairway', coordinates: { latitude: 33.2355, longitude: -89.1245 } },
          { type: 'sand', name: 'Right greenside bunker', coordinates: { latitude: 33.2359, longitude: -89.1249 } }
        ],
        landmarks: [
          { type: 'fairway', name: 'Landing area', coordinates: { latitude: 33.2350, longitude: -89.1240 } },
          { type: 'green', name: 'Green center', coordinates: { latitude: 33.2360, longitude: -89.1250 } }
        ]
      },
      // Add more holes as needed - sample for hole 2
      {
        hole: 2,
        par: 4,
        teeBoxes: [
          { name: "Black Tees", coordinates: { latitude: 33.2365, longitude: -89.1260 }, yardage: 385 },
          { name: "Blue Tees", coordinates: { latitude: 33.2366, longitude: -89.1261 }, yardage: 365 },
          { name: "White Tees", coordinates: { latitude: 33.2367, longitude: -89.1262 }, yardage: 340 },
          { name: "Red Tees", coordinates: { latitude: 33.2368, longitude: -89.1263 }, yardage: 290 }
        ],
        pin: { latitude: 33.2380, longitude: -89.1275 },
        hazards: [
          { type: 'sand', name: 'Left fairway bunker', coordinates: { latitude: 33.2370, longitude: -89.1265 } },
          { type: 'sand', name: 'Green front bunker', coordinates: { latitude: 33.2378, longitude: -89.1273 } }
        ],
        landmarks: [
          { type: 'fairway', name: 'Dogleg turn', coordinates: { latitude: 33.2375, longitude: -89.1270 } },
          { type: 'green', name: 'Green center', coordinates: { latitude: 33.2380, longitude: -89.1275 } }
        ]
      }
    ];

    // GPS data for Dancing Rabbit Golf Club - Oaks Course
    const oaksGPS: HoleGPSData[] = [
      {
        hole: 1,
        par: 4,
        teeBoxes: [
          { name: "Black Tees", coordinates: { latitude: 33.2400, longitude: -89.1300 }, yardage: 410 },
          { name: "Blue Tees", coordinates: { latitude: 33.2401, longitude: -89.1301 }, yardage: 380 },
          { name: "White Tees", coordinates: { latitude: 33.2402, longitude: -89.1302 }, yardage: 350 },
          { name: "Red Tees", coordinates: { latitude: 33.2403, longitude: -89.1303 }, yardage: 300 }
        ],
        pin: { latitude: 33.2415, longitude: -89.1315 },
        hazards: [
          { type: 'water', name: 'Pond left of green', coordinates: { latitude: 33.2413, longitude: -89.1313 } },
          { type: 'sand', name: 'Right fairway bunker', coordinates: { latitude: 33.2408, longitude: -89.1308 } }
        ],
        landmarks: [
          { type: 'fairway', name: 'Fairway center', coordinates: { latitude: 33.2407, longitude: -89.1307 } },
          { type: 'green', name: 'Green center', coordinates: { latitude: 33.2415, longitude: -89.1315 } }
        ]
      }
    ];

    this.courseGPSData.set("Azaleas Course", azaleasGPS);
    this.courseGPSData.set("Oaks Course", oaksGPS);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const tournament: Tournament = {
      id: this.currentTournamentId++,
      name: insertTournament.name,
      startDate: insertTournament.startDate,
      endDate: insertTournament.endDate,
      course: insertTournament.course,
      location: insertTournament.location ?? null,
      totalRounds: insertTournament.totalRounds || 2,
      currentRound: insertTournament.currentRound || 1,
      coursePar: insertTournament.coursePar || 72,
      isActive: insertTournament.isActive ?? true,
      courseConfiguration: insertTournament.courseConfiguration ?? null,
      tournamentType: insertTournament.tournamentType ?? "stroke_play",
      createdAt: new Date(),
    };
    this.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async getActiveTournament(): Promise<Tournament | undefined> {
    return Array.from(this.tournaments.values()).find(t => t.isActive);
  }

  async updateTournament(id: number, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    const updated = { ...tournament, ...updates };
    this.tournaments.set(id, updated);
    return updated;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const player: Player = {
      id: this.currentPlayerId++,
      name: insertPlayer.name,
      handicap: insertPlayer.handicap,
      tournamentId: insertPlayer.tournamentId || null,
      createdAt: new Date(),
    };
    this.players.set(player.id, player);
    return player;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByTournament(tournamentId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(p => p.tournamentId === tournamentId);
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updated = { ...player, ...updates };
    this.players.set(id, updated);
    return updated;
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const round: Round = {
      id: this.currentRoundId++,
      playerId: insertRound.playerId || null,
      tournamentId: insertRound.tournamentId || null,
      roundNumber: insertRound.roundNumber,
      courseName: insertRound.courseName,
      grossScore: insertRound.grossScore || null,
      netScore: insertRound.netScore || null,
      isComplete: insertRound.isComplete || false,
      isStarted: insertRound.isStarted || false,
      currentHole: insertRound.currentHole || null,
      createdAt: new Date(),
    };
    this.rounds.set(round.id, round);
    return round;
  }

  async getRound(id: number): Promise<Round | undefined> {
    return this.rounds.get(id);
  }

  async getRoundsByPlayer(playerId: number): Promise<Round[]> {
    return Array.from(this.rounds.values()).filter(r => r.playerId === playerId);
  }

  async updateRound(id: number, updates: Partial<Round>): Promise<Round | undefined> {
    const round = this.rounds.get(id);
    if (!round) return undefined;
    
    const updated = { ...round, ...updates };
    this.rounds.set(id, updated);
    return updated;
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const score: Score = {
      id: this.currentScoreId++,
      playerId: insertScore.playerId || null,
      roundId: insertScore.roundId || null,
      hole: insertScore.hole,
      strokes: insertScore.strokes,
      createdAt: new Date(),
    };
    this.scores.set(score.id, score);
    return score;
  }

  async getScore(id: number): Promise<Score | undefined> {
    return this.scores.get(id);
  }

  async getScoresByRound(roundId: number): Promise<Score[]> {
    return Array.from(this.scores.values()).filter(s => s.roundId === roundId);
  }

  async updateScore(id: number, updates: Partial<Score>): Promise<Score | undefined> {
    const score = this.scores.get(id);
    if (!score) return undefined;
    
    const updated = { ...score, ...updates };
    this.scores.set(id, updated);
    return updated;
  }

  async getLeaderboard(tournamentId: number): Promise<PlayerWithScores[]> {
    const tournamentPlayers = await this.getPlayersByTournament(tournamentId);
    const tournament = await this.getTournament(tournamentId);
    
    if (!tournament) return [];

    const playersWithScores = await Promise.all(
      tournamentPlayers.map(async (player) => {
        const playerRounds = await this.getRoundsByPlayer(player.id);
        const roundsWithScores = await Promise.all(
          playerRounds.map(async (round) => {
            const roundScores = await this.getScoresByRound(round.id);
            return { ...round, scores: roundScores };
          })
        );

        // Calculate totals
        const totalGross = roundsWithScores.reduce((sum, round) => sum + (round.grossScore || 0), 0);
        const totalNet = roundsWithScores.reduce((sum, round) => sum + (round.netScore || 0), 0);
        const toPar = totalNet - (tournament.coursePar * roundsWithScores.length);

        // Determine status
        const currentRound = roundsWithScores.find(r => r.roundNumber === tournament.currentRound);
        let status = "Not Started";
        if (currentRound) {
          if (currentRound.isComplete) {
            status = "Completed";
          } else {
            status = `Playing - Hole ${currentRound.currentHole || 1}`;
          }
        }

        return {
          ...player,
          rounds: roundsWithScores,
          totalGross,
          totalNet,
          toPar,
          position: 0, // Will be calculated after sorting
          status,
        };
      })
    );

    // Sort by total net score and assign positions
    playersWithScores.sort((a, b) => a.totalNet - b.totalNet);
    playersWithScores.forEach((player, index) => {
      player.position = index + 1;
    });

    return playersWithScores;
  }

  async calculateSkins(tournamentId: number, roundNumber: number, totalPrize: number): Promise<SkinsGame> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const playersInTournament = await this.getPlayersByTournament(tournamentId);
    const roundsForRound = Array.from(this.rounds.values()).filter(
      r => r.tournamentId === tournamentId && r.roundNumber === roundNumber
    );

    const courseName = roundsForRound[0]?.courseName || 'Unknown Course';
    const prizePerHole = totalPrize / 18;
    const results: SkinResult[] = [];
    let carryOver = 0;
    let totalPaid = 0;

    // Get standard par for each hole (assuming par 72 course)
    const standardPars = [
      4, 4, 3, 4, 5, 4, 3, 4, 4, // Front 9
      4, 5, 3, 4, 4, 3, 4, 5, 4  // Back 9
    ];

    for (let hole = 1; hole <= 18; hole++) {
      const par = standardPars[hole - 1];
      const holeScores: { playerId: number; playerName: string; grossScore: number; netScore: number; handicapStrokes: number }[] = [];

      // Get all scores for this hole
      for (const round of roundsForRound) {
        const player = playersInTournament.find(p => p.id === round.playerId);
        if (!player) continue;

        const score = Array.from(this.scores.values()).find(
          s => s.roundId === round.id && s.hole === hole
        );

        if (score) {
          // Calculate handicap strokes for this hole
          const handicapStrokes = Math.floor(player.handicap / 18) + 
            (hole <= (player.handicap % 18) ? 1 : 0);
          
          holeScores.push({
            playerId: player.id,
            playerName: player.name,
            grossScore: score.strokes,
            netScore: score.strokes - handicapStrokes,
            handicapStrokes
          });
        }
      }

      // Find winners for both gross and net
      const grossWinners = this.findSkinWinners(holeScores, 'gross');
      const netWinners = this.findSkinWinners(holeScores, 'net');

      const currentPrize = prizePerHole + carryOver;
      let holeWinners: Array<{ playerId: number; playerName: string; grossScore: number; netScore: number; winType: 'gross' | 'net' }> = [];
      let prizeAmount = 0;

      // Determine if there are skin winners
      if (grossWinners.length === 1 && netWinners.length === 1) {
        // Both gross and net have single winners
        holeWinners = [
          { ...grossWinners[0], winType: 'gross' as const },
          { ...netWinners[0], winType: 'net' as const }
        ];
        prizeAmount = currentPrize;
        carryOver = 0;
      } else if (grossWinners.length === 1) {
        // Only gross has a single winner
        holeWinners = [{ ...grossWinners[0], winType: 'gross' as const }];
        prizeAmount = currentPrize;
        carryOver = 0;
      } else if (netWinners.length === 1) {
        // Only net has a single winner
        holeWinners = [{ ...netWinners[0], winType: 'net' as const }];
        prizeAmount = currentPrize;
        carryOver = 0;
      } else {
        // No single winner, carry over
        carryOver += prizePerHole;
      }

      totalPaid += prizeAmount;

      results.push({
        hole,
        par,
        winners: holeWinners,
        carryOver: carryOver,
        prizeAmount
      });
    }

    return {
      tournamentId,
      roundNumber,
      courseName,
      totalPrize,
      prizePerHole,
      results,
      totalPaid,
      carryOverAmount: carryOver
    };
  }

  private findSkinWinners(holeScores: { playerId: number; playerName: string; grossScore: number; netScore: number }[], type: 'gross' | 'net') {
    if (holeScores.length === 0) return [];

    const scoreKey = type === 'gross' ? 'grossScore' : 'netScore';
    const bestScore = Math.min(...holeScores.map(s => s[scoreKey]));
    const winners = holeScores.filter(s => s[scoreKey] === bestScore);

    return winners;
  }

  async calculateStableford(tournamentId: number, roundNumber: number, system: 'stableford' | 'modified-stableford'): Promise<StablefordResult> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const playersInTournament = await this.getPlayersByTournament(tournamentId);
    const roundsForRound = Array.from(this.rounds.values()).filter(
      r => r.tournamentId === tournamentId && r.roundNumber === roundNumber
    );

    const courseName = roundsForRound[0]?.courseName || 'Unknown Course';

    // Standard par for each hole (assuming par 72 course)
    const standardPars = [
      4, 4, 3, 4, 5, 4, 3, 4, 4, // Front 9
      4, 5, 3, 4, 4, 3, 4, 5, 4  // Back 9
    ];

    const holes = [];
    const playerTotals = new Map<number, {
      playerId: number;
      playerName: string;
      handicap: number;
      totalPoints: number;
      totalGross: number;
      totalNet: number;
    }>();

    // Initialize player totals
    playersInTournament.forEach(player => {
      playerTotals.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        handicap: player.handicap,
        totalPoints: 0,
        totalGross: 0,
        totalNet: 0
      });
    });

    for (let hole = 1; hole <= 18; hole++) {
      const par = standardPars[hole - 1];
      const playerScores = [];

      // Get all scores for this hole
      for (const round of roundsForRound) {
        const player = playersInTournament.find(p => p.id === round.playerId);
        if (!player) continue;

        const score = Array.from(this.scores.values()).find(
          s => s.roundId === round.id && s.hole === hole
        );

        if (score) {
          // Calculate handicap strokes for this hole
          const handicapStrokes = Math.floor(player.handicap / 18) + 
            (hole <= (player.handicap % 18) ? 1 : 0);
          
          const netScore = score.strokes - handicapStrokes;
          const stablefordPoints = this.calculateStablefordPoints(score.strokes, par, handicapStrokes, 'stableford');
          const modifiedStablefordPoints = this.calculateStablefordPoints(score.strokes, par, handicapStrokes, 'modified-stableford');
          const result = this.getScoreResult(netScore, par);

          playerScores.push({
            playerId: player.id,
            playerName: player.name,
            grossScore: score.strokes,
            netScore,
            stablefordPoints,
            modifiedStablefordPoints,
            result
          });

          // Update player totals
          const playerTotal = playerTotals.get(player.id)!;
          playerTotal.totalPoints += system === 'stableford' ? stablefordPoints : modifiedStablefordPoints;
          playerTotal.totalGross += score.strokes;
          playerTotal.totalNet += netScore;
        }
      }

      holes.push({
        hole,
        par,
        playerScores
      });
    }

    // Convert to array and sort by points
    const sortedPlayerTotals = Array.from(playerTotals.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((player, index) => ({
        ...player,
        position: index + 1
      }));

    return {
      tournamentId,
      roundNumber,
      courseName,
      system,
      holes,
      playerTotals: sortedPlayerTotals
    };
  }

  private calculateStablefordPoints(grossScore: number, par: number, handicapStrokes: number, system: 'stableford' | 'modified-stableford'): number {
    const netScore = grossScore - handicapStrokes;
    const scoreToPar = netScore - par;

    if (system === 'stableford') {
      // Traditional Stableford scoring
      if (scoreToPar <= -2) return 4; // Eagle or better
      if (scoreToPar === -1) return 3; // Birdie
      if (scoreToPar === 0) return 2;  // Par
      if (scoreToPar === 1) return 1;  // Bogey
      return 0; // Double bogey or worse
    } else {
      // Modified Stableford (more aggressive scoring)
      if (scoreToPar <= -3) return 8;  // Albatross or better
      if (scoreToPar === -2) return 5; // Eagle
      if (scoreToPar === -1) return 2; // Birdie
      if (scoreToPar === 0) return 0;  // Par
      if (scoreToPar === 1) return -1; // Bogey
      if (scoreToPar === 2) return -3; // Double bogey
      return -5; // Triple bogey or worse
    }
  }

  private getScoreResult(netScore: number, par: number): string {
    const scoreToPar = netScore - par;
    
    if (scoreToPar <= -3) return 'Albatross';
    if (scoreToPar === -2) return 'Eagle';
    if (scoreToPar === -1) return 'Birdie';
    if (scoreToPar === 0) return 'Par';
    if (scoreToPar === 1) return 'Bogey';
    if (scoreToPar === 2) return 'Double Bogey';
    if (scoreToPar === 3) return 'Triple Bogey';
    return `+${scoreToPar}`;
  }

  async getHoleGPSData(courseName: string, hole: number): Promise<HoleGPSData | undefined> {
    const courseData = this.courseGPSData.get(courseName);
    if (!courseData) return undefined;
    
    return courseData.find(h => h.hole === hole);
  }

  async calculateDistances(courseName: string, hole: number, playerLocation: GPSCoordinate): Promise<DistanceCalculation> {
    const holeData = await this.getHoleGPSData(courseName, hole);
    
    if (!holeData) {
      throw new Error(`GPS data not found for ${courseName} hole ${hole}`);
    }

    // Calculate distance to pin
    const distanceToPin = this.calculateDistance(playerLocation, holeData.pin);

    // Calculate distances to tee boxes
    const distanceToTees = holeData.teeBoxes.map(tee => ({
      name: tee.name,
      distance: this.calculateDistance(playerLocation, tee.coordinates)
    }));

    // Find nearby hazards (within 200 yards)
    const nearbyHazards = holeData.hazards
      .map(hazard => ({
        type: hazard.type,
        name: hazard.name,
        distance: this.calculateDistance(playerLocation, hazard.coordinates)
      }))
      .filter(hazard => hazard.distance <= 200)
      .sort((a, b) => a.distance - b.distance);

    // Find nearby landmarks (within 300 yards)
    const nearbyLandmarks = holeData.landmarks
      .map(landmark => ({
        type: landmark.type,
        name: landmark.name,
        distance: this.calculateDistance(playerLocation, landmark.coordinates)
      }))
      .filter(landmark => landmark.distance <= 300)
      .sort((a, b) => a.distance - b.distance);

    return {
      hole,
      playerLocation,
      distanceToPin,
      distanceToTees,
      nearbyHazards,
      nearbyLandmarks
    };
  }

  private calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
    // Haversine formula to calculate distance between two GPS coordinates
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // Distance in meters
    
    // Convert to yards (1 meter = 1.09361 yards)
    return Math.round(distance * 1.09361);
  }
}

export const storage = new MemStorage();
