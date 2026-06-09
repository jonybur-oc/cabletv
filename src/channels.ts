/**
 * Channel definitions and content library.
 * 
 * Start simple: one channel per streaming service per genre.
 * Netflix IDs and HBO slugs are real — these are actual titles.
 */

import type { Channel } from './scheduler';

export const CHANNELS: Channel[] = [
  {
    id: 'hbo-fantasy',
    name: 'HBO Fantasy',
    service: 'hbo',
    genre: 'Fantasy',
    color: '#8B5CF6',
    schedule: [
      {
        id: 'game-of-thrones-s1e1',
        title: 'Game of Thrones — S1E1',
        year: 2011,
        durationMins: 61,
        hboId: 'urn:hbo:episode:GVU2cggagzYNJjhsJATwo-w',
        genre: 'Fantasy',
        description: 'Winter is coming.',
      },
      {
        id: 'game-of-thrones-s1e2',
        title: 'Game of Thrones — S1E2',
        year: 2011,
        durationMins: 55,
        hboId: 'urn:hbo:episode:GVU2cggagzYNJjhsJATwq-w',
        genre: 'Fantasy',
        description: 'The Kingsroad.',
      },
      {
        id: 'house-of-dragon-s1e1',
        title: 'House of the Dragon — S1E1',
        year: 2022,
        durationMins: 66,
        hboId: 'urn:hbo:episode:GYjp4ywVXoYNSrwEAAAAO',
        genre: 'Fantasy',
        description: 'The Heirs of the Dragon.',
      },
      {
        id: 'the-witcher-s1e1',
        title: 'The Witcher — S1E1',
        year: 2019,
        durationMins: 61,
        netflixId: '80189685',
        genre: 'Fantasy',
        description: 'The End\'s Beginning.',
      },
    ],
  },
  {
    id: 'netflix-crime',
    name: 'Netflix Crime',
    service: 'netflix',
    genre: 'Crime',
    color: '#EF4444',
    schedule: [
      {
        id: 'ozark-s1e1',
        title: 'Ozark — S1E1',
        year: 2017,
        durationMins: 60,
        netflixId: '80117552',
        genre: 'Crime',
        description: 'The Byrde family relocates to the Ozarks.',
      },
      {
        id: 'mindhunter-s1e1',
        title: 'Mindhunter — S1E1',
        year: 2017,
        durationMins: 55,
        netflixId: '80114855',
        genre: 'Crime',
        description: 'FBI agents study serial killers.',
      },
      {
        id: 'narcos-s1e1',
        title: 'Narcos — S1E1',
        year: 2015,
        durationMins: 53,
        netflixId: '80025172',
        genre: 'Crime',
        description: 'The rise of Pablo Escobar.',
      },
    ],
  },
  {
    id: 'hbo-war',
    name: 'HBO War',
    service: 'hbo',
    genre: 'War',
    color: '#6B7280',
    schedule: [
      {
        id: 'band-of-brothers-s1e1',
        title: 'Band of Brothers — S1E1',
        year: 2001,
        durationMins: 73,
        hboId: 'urn:hbo:episode:GVU2cggagzYNJjhsJAT1e-w',
        genre: 'War',
        description: 'Easy Company trains at Toccoa.',
      },
      {
        id: 'the-pacific-s1e1',
        title: 'The Pacific — S1E1',
        year: 2010,
        durationMins: 75,
        hboId: 'urn:hbo:episode:GVU2cggagzYNJjhsJAU3--w',
        genre: 'War',
        description: 'Guadalcanal.',
      },
    ],
  },
  {
    id: 'netflix-scifi',
    name: 'Netflix Sci-Fi',
    service: 'netflix',
    genre: 'Sci-Fi',
    color: '#3B82F6',
    schedule: [
      {
        id: 'dark-s1e1',
        title: 'Dark — S1E1',
        year: 2017,
        durationMins: 51,
        netflixId: '80100172',
        genre: 'Sci-Fi',
        description: 'Children go missing in Winden.',
      },
      {
        id: 'stranger-things-s1e1',
        title: 'Stranger Things — S1E1',
        year: 2016,
        durationMins: 47,
        netflixId: '80057281',
        genre: 'Sci-Fi',
        description: 'A boy vanishes. The Upside Down awakens.',
      },
      {
        id: 'black-mirror-s3e1',
        title: 'Black Mirror — Nosedive',
        year: 2016,
        durationMins: 62,
        netflixId: '70264888',
        genre: 'Sci-Fi',
        description: 'A world rated by social score.',
      },
    ],
  },
];
