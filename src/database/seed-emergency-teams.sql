-- Sample Emergency Teams in Bukidnon Province, Philippines
-- Run this in your Supabase SQL Editor to populate the emergency_teams table

INSERT INTO emergency_teams (name, type, location, lat, lng, hotline) VALUES
  -- Police Stations
  ('Malaybalay City Police Station', 'police', 'Malaybalay City, Bukidnon', 8.1536, 125.1279, '(088) 221-3344'),
  ('Valencia City Police Station', 'police', 'Valencia City, Bukidnon', 7.9067, 125.0939, '(088) 828-1234'),
  ('Manolo Fortich Police Station', 'police', 'Manolo Fortich, Bukidnon', 8.3667, 124.8667, '(088) 356-1234'),
  ('Quezon Municipal Police Station', 'police', 'Quezon, Bukidnon', 7.7333, 125.1000, '(088) 310-5678'),
  ('Don Carlos Police Station', 'police', 'Don Carlos, Bukidnon', 7.6833, 125.0000, '(088) 356-7890'),
  
  -- Fire Departments
  ('Malaybalay City Fire Station', 'fire', 'Malaybalay City, Bukidnon', 8.1500, 125.1300, '(088) 221-2345'),
  ('Valencia City Fire Station', 'fire', 'Valencia City, Bukidnon', 7.9100, 125.0950, '(088) 828-3456'),
  ('Manolo Fortich Fire Station', 'fire', 'Manolo Fortich, Bukidnon', 8.3700, 124.8700, '(088) 356-4567'),
  ('Maramag Fire Station', 'fire', 'Maramag, Bukidnon', 7.7667, 125.0167, '(088) 221-5678'),
  ('Lantapan Fire Station', 'fire', 'Lantapan, Bukidnon', 7.9833, 125.0333, '(088) 356-6789'),
  
  -- Rescue Teams
  ('Bukidnon Provincial Rescue Team', 'rescue', 'Malaybalay City, Bukidnon', 8.1550, 125.1250, '(088) 221-4567'),
  ('Valencia City Rescue Unit', 'rescue', 'Valencia City, Bukidnon', 7.9050, 125.0920, '(088) 828-5678'),
  ('Manolo Fortich Emergency Response', 'rescue', 'Manolo Fortich, Bukidnon', 8.3650, 124.8650, '(088) 356-7891'),
  ('Quezon Municipal Rescue', 'rescue', 'Quezon, Bukidnon', 7.7350, 125.0980, '(088) 310-6789'),
  ('Sumilao Emergency Team', 'rescue', 'Sumilao, Bukidnon', 8.2833, 124.9500, '(088) 221-7890'),
  ('Impasugong Rescue Unit', 'rescue', 'Impasugong, Bukidnon', 8.3000, 125.0000, '(088) 356-8901'),
  ('Libona Emergency Response', 'rescue', 'Libona, Bukidnon', 8.3333, 124.7333, '(088) 221-9012'),
  ('Talakag Rescue Team', 'rescue', 'Talakag, Bukidnon', 8.2333, 124.6000, '(088) 356-0123'),
  
  -- Specific Requested Locations
  ('CDRRMO Valencia', 'rescue', 'Valencia City, Bukidnon', 7.930789359108319, 125.09803547110613, '(088) 828-9999'),
  ('MDRRMC Pangantucan', 'rescue', 'Pangantucan, Bukidnon', 7.828728554466357, 124.82813288569363, '(088) 356-8888'),
  ('Adtuyon Rescue Outpost', 'rescue', 'Pangantucan, Bukidnon', 7.815833528296667, 124.85540567191764, '(088) 356-7777');

-- Verify the data was inserted
SELECT 
  type,
  COUNT(*) as count
FROM emergency_teams
GROUP BY type
ORDER BY type;

-- View the newly added specific locations
SELECT 
  name,
  location,
  lat,
  lng,
  hotline
FROM emergency_teams
WHERE name IN ('CDRRMO Valencia', 'MDRRMC Pangantucan', 'Adtuyon Rescue Outpost')
ORDER BY name;