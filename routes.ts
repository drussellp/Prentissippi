import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertPlayerSchema, insertScoreSchema, insertRoundSchema } from "@shared/schema";
import { z } from "zod";

const clients = new Set<WebSocket>();

function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Tournament routes
  app.get('/api/tournament/active', async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.status(404).json({ error: 'No active tournament found' });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active tournament' });
    }
  });

  app.get('/api/tournament/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tournament = await storage.getTournament(id);
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tournament' });
    }
  });

  // Player routes
  app.get('/api/players/:tournamentId', async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.tournamentId);
      const players = await storage.getPlayersByTournament(tournamentId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  });

  app.post('/api/players', async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      
      // Create initial rounds for the player
      if (playerData.tournamentId) {
        const tournament = await storage.getTournament(playerData.tournamentId);
        if (tournament) {
          const courses = ["Azaleas Course", "Oaks Course"];
          for (let i = 1; i <= tournament.totalRounds; i++) {
            await storage.createRound({
              playerId: player.id,
              tournamentId: tournament.id,
              roundNumber: i,
              courseName: courses[i - 1] || "Main Course",
              grossScore: null,
              netScore: null,
              isComplete: false,
              isStarted: false,
              currentHole: 1,
            });
          }
        }
      }
      
      broadcastUpdate('player_created', player);
      res.json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid player data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create player' });
    }
  });

  // Round routes
  app.get('/api/players/:playerId/rounds', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const rounds = await storage.getRoundsByPlayer(playerId);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rounds' });
    }
  });

  app.post('/api/rounds/:roundId/start', async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const round = await storage.updateRound(roundId, {
        isStarted: true,
        currentHole: 1,
      });
      if (!round) {
        return res.status(404).json({ error: 'Round not found' });
      }
      broadcastUpdate('round_started', round);
      res.json(round);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start round' });
    }
  });

  // Score routes
  app.post('/api/scores', async (req, res) => {
    try {
      const scoreData = insertScoreSchema.parse(req.body);
      const score = await storage.createScore(scoreData);
      
      // Update round with new score
      if (scoreData.roundId) {
        const round = await storage.getRound(scoreData.roundId);
        if (round && round.playerId) {
          const roundScores = await storage.getScoresByRound(round.id);
          const grossScore = roundScores.reduce((sum, s) => sum + s.strokes, 0);
          const player = await storage.getPlayer(round.playerId);
          const netScore = player ? grossScore - player.handicap : grossScore;
          const isComplete = roundScores.length === 18;
          
          await storage.updateRound(round.id, {
            grossScore,
            netScore,
            isComplete,
            currentHole: Math.min(roundScores.length + 1, 18),
          });
        }
      }
      
      broadcastUpdate('score_updated', score);
      res.json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid score data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create score' });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard/:tournamentId', async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.tournamentId);
      const leaderboard = await storage.getLeaderboard(tournamentId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Skins
  app.get('/api/skins/:tournamentId/:roundNumber', async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.tournamentId);
      const roundNumber = parseInt(req.params.roundNumber);
      const totalPrize = parseInt(req.query.totalPrize as string) || 1800; // Default $1800 total prize
      
      const skins = await storage.calculateSkins(tournamentId, roundNumber, totalPrize);
      res.json(skins);
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate skins' });
    }
  });

  // Stableford
  app.get('/api/stableford/:tournamentId/:roundNumber', async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.tournamentId);
      const roundNumber = parseInt(req.params.roundNumber);
      const system = (req.query.system as string) || 'stableford';
      
      if (system !== 'stableford' && system !== 'modified-stableford') {
        return res.status(400).json({ error: 'Invalid system. Must be "stableford" or "modified-stableford"' });
      }
      
      const stableford = await storage.calculateStableford(tournamentId, roundNumber, system);
      res.json(stableford);
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate stableford' });
    }
  });

  // GPS routes
  app.get('/api/gps/:courseName/:hole', async (req, res) => {
    try {
      const courseName = decodeURIComponent(req.params.courseName);
      const hole = parseInt(req.params.hole);
      
      const gpsData = await storage.getHoleGPSData(courseName, hole);
      if (!gpsData) {
        return res.status(404).json({ error: 'GPS data not found for this hole' });
      }
      
      res.json(gpsData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch GPS data' });
    }
  });

  app.post('/api/gps/distances', async (req, res) => {
    try {
      const { courseName, hole, latitude, longitude } = req.body;
      
      if (!courseName || !hole || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const distances = await storage.calculateDistances(
        courseName, 
        hole, 
        { latitude, longitude }
      );
      
      res.json(distances);
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate distances' });
    }
  });

  // Tournament stats route
  app.get('/api/tournament/:id/stats', async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const players = await storage.getPlayersByTournament(tournamentId);
      const tournament = await storage.getTournament(tournamentId);
      
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      let completedRounds = 0;
      let playersStillPlaying = 0;
      
      for (const player of players) {
        const rounds = await storage.getRoundsByPlayer(player.id);
        const currentRound = rounds.find(r => r.roundNumber === tournament.currentRound);
        
        if (currentRound) {
          if (currentRound.isComplete) {
            completedRounds++;
          } else {
            playersStillPlaying++;
          }
        }
      }

      const stats = {
        totalPlayers: players.length,
        completedRounds,
        playersStillPlaying,
        coursePar: tournament.coursePar,
        currentRound: tournament.currentRound,
        totalRounds: tournament.totalRounds,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tournament stats' });
    }
  });

  return httpServer;
}
