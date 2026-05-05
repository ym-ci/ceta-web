// import { Engine } from '@ctrl/golang-template';
// import * as fs from 'fs';

// // 1. Define the Data Interfaces to match your Go Template logic
// interface Alliance {
//   Id: string;
//   TeamIds: string[];
// }

// interface Matchup {
//   Id: string;
//   IsActive: boolean;
//   IsComplete: boolean;
//   SeriesLeader: 'red' | 'blue' | '';
//   SeriesStatus: string;
//   RedAlliance?: Alliance;
//   BlueAlliance?: Alliance;
//   RedAllianceSource?: string;
//   BlueAllianceSource?: string;
// }

// interface BracketData {
//   BracketType: 'double' | '16' | '8' | '4' | '2';
//   Matchups: Record<string, Matchup>;
// }

// // 2. Load your template file (assuming it's saved as bracket.tmpl)
// const templateSource = fs.readFileSync('bracket.tmpl', 'utf8');

// // 3. Create sample data
// const data: BracketData = {
//   BracketType: 'double',
//   Matchups: {
//     M1: {
//       Id: 'M1',
//       IsActive: true,
//       IsComplete: false,
//       SeriesLeader: '',
//       SeriesStatus: 'In Progress',
//       RedAlliance: { Id: '1', TeamIds: ['118', '1678', '254'] },
//       BlueAlliance: { Id: '8', TeamIds: ['1323', '4414', '973'] },
//     },
//     M2: {
//       Id: 'M2',
//       IsActive: false,
//       IsComplete: true,
//       SeriesLeader: 'red',
//       SeriesStatus: '2-0',
//       RedAlliance: { Id: '4', TeamIds: ['2056', '1114', '27'] },
//       BlueAlliance: { Id: '5', TeamIds: ['33', '469', '67'] },
//     },
//     M3: {
//       Id: 'M3',
//       IsActive: false,
//       IsComplete: false,
//       SeriesLeader: '',
//       SeriesStatus: 'TBD',
//       RedAllianceSource: 'Winner of QF1',
//       BlueAllianceSource: 'Winner of QF2',
//     }
//     // Add other matches (M4...M13, F) as needed for your bracket type
//   }
// };

// async function render() {
//   try {
//     const engine = new Engine();
    
//     // Parse the full file containing the "bracket" and "matchup" defines
//     engine.parse(templateSource);

//     // Execute the specific "bracket" template with our data
//     // The library allows executing a specific named template from the parsed set
//     const result = engine.execute(data, 'bracket');

//     // Output to file
//     fs.writeFileSync('output.svg', result);
//     console.log('Successfully rendered bracket to output.svg');
//   } catch (err) {
//     console.error('Error rendering template:', err);
//   }
// }

// render();