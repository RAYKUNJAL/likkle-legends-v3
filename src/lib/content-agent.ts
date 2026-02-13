import { generateContent } from './gemini';

export type ContentCategory = 
    | 'worksheet' 
    | 'coloring' 
    | 'activity' 
    | 'craft' 
    | 'game' 
    | 'song' 
    | 'story' 
    | 'flashcard';

export type AgeBand = '3-4' | '5-6' | '7-8';

export type Subject = 
    | 'literacy' 
    | 'numeracy' 
    | 'science' 
    | 'social_studies' 
    | 'art' 
    | 'music' 
    | 'caribbean_culture' 
    | 'language_arts';

// All Caribbean Nations and Territories
export type Island = 
    | 'ALL'
    // Greater Antilles
    | 'JM' | 'HT' | 'DO' | 'CU' | 'PR'
    // Lesser Antilles - Leeward Islands  
    | 'AG' | 'AI' | 'KN' | 'MS' | 'VG' | 'VI' | 'SX' | 'MF' | 'BL' | 'GP'
    // Lesser Antilles - Windward Islands
    | 'DM' | 'MQ' | 'LC' | 'VC' | 'GD' | 'BB'
    // Southern Caribbean
    | 'TT' | 'AW' | 'CW' | 'BQ'
    // Continental Caribbean
    | 'GY' | 'SR' | 'GF' | 'BZ'
    // Others
    | 'BS' | 'TC' | 'KY' | 'BM';

export interface ContentRequest {
    category: ContentCategory;
    ageBand: AgeBand;
    subject: Subject;
    island: Island;
    topic?: string;
    dialectMode?: 'standard' | 'local';
    includeTeacherNotes?: boolean;
}

export interface GeneratedContent {
    title: string;
    description: string;
    instructions: string;
    content: string;
    teacherNotes?: string;
    learningObjectives: string[];
    materials?: string[];
    duration?: string;
    difficulty: 'easy' | 'medium' | 'challenging';
    caribbeanContext: string;
    keywords: string[];
}

// Complete Caribbean Themes by Island/Territory
const CARIBBEAN_THEMES: Record<Island, string[]> = {
    ALL: ['Caribbean Sea', 'Palm trees', 'Coral reefs', 'Tropical fruits', 'Island life', 'Family', 'Beach', 'Coconut'],
    
    // Greater Antilles
    JM: ['Reggae', 'Blue Mountains', 'Ackee', 'Doctor Bird', 'Jerk', 'Maroons', 'Bob Marley', 'Patois', 'Dunn\'s River'],
    HT: ['Kompa', 'Citadelle', 'Griots', 'Vodou art', 'Creole', 'Toussaint', 'Tap-tap', 'Iron Market', 'Labadee'],
    DO: ['Merengue', 'Bachata', 'Pico Duarte', 'Mamajuana', 'Baseball', 'Zona Colonial', 'Mangú', 'Larimar'],
    CU: ['Salsa', 'Classic Cars', 'Cigars', 'Havana', 'Rumba', 'Mojito', 'Malecón', 'José Martí', 'Cuban Trogon'],
    PR: ['Salsa', 'El Yunque', 'Coquí', 'Mofongo', 'Old San Juan', 'Vejigante', 'Bomba', 'Plena'],
    
    // Leeward Islands
    AG: ['Sailing Week', 'Cricket', 'Fungee', 'Nelson\'s Dockyard', 'Black Pineapple', 'Shirley Heights', '365 Beaches'],
    AI: ['Boat Racing', 'Lobster', 'Sandy beaches', 'Salt ponds', 'Heritage sites'],
    KN: ['Brimstone Hill', 'Green Vervet Monkey', 'Sugar Train', 'Carnival', 'Nevis Peak', 'Alexander Hamilton'],
    MS: ['Volcano', 'Emerald Isle', 'Irish heritage', 'Goat Water', 'Oriole bird', 'St. Patrick\'s Day'],
    VG: ['Sailing', 'Virgin Gorda Baths', 'Anegada Lobster', 'Fungi music', 'Jost Van Dyke'],
    VI: ['Carnival', 'Calypso', 'Moko Jumbie', 'Fungi', 'Pate', 'Charlotte Amalie'],
    SX: ['Dual Nation', 'Guavaberry', 'Carnival', 'Orient Beach', 'St. Maarten Heineken Regatta'],
    MF: ['French Caribbean', 'Marigot', 'Creole culture', 'Carnival', 'Grand Case'],
    BL: ['French elegance', 'Gustavia', 'Sailing', 'Caribbean chic'],
    GP: ['French Antilles', 'Gwoka', 'Creole', 'Butterfly island', 'Basse-Terre', 'Grande-Terre', 'Bokit'],
    
    // Windward Islands
    DM: ['Nature Isle', 'Boiling Lake', 'Sisserou Parrot', 'Creole', 'Morne Trois Pitons', 'Kalinago Territory', 'Bouyon'],
    MQ: ['Mount Pelée', 'Fort-de-France', 'Biguine', 'Creole', 'Colombo', 'Zouk', 'Rum'],
    LC: ['Pitons', 'Jazz Festival', 'Banana', 'Saint Lucia Parrot', 'Creole', 'Jounen Kweyol', 'Sulphur Springs'],
    VC: ['La Soufrière', 'Breadfruit', 'Bequia', 'Vincy Mas', 'Arrowroot', 'Botanical Gardens'],
    GD: ['Nutmeg', 'Spice Island', 'Carnival', 'Grand Anse', 'Oil Down', 'Chocolate', 'Fort George', 'Underwater Sculpture'],
    BB: ['Flying Fish', 'Crop Over', 'Chattel Houses', 'Mount Gay Rum', 'Harrison\'s Cave', 'Cou-cou', 'Rihanna'],
    
    // Southern Caribbean
    TT: ['Carnival', 'Steelpan', 'Doubles', 'Hummingbird', 'Scarlet Ibis', 'Pitch Lake', 'Parang', 'Limbo', 'Soca'],
    AW: ['One Happy Island', 'Divi-divi Trees', 'Papiamento', 'Natural Bridge', 'Carnival', 'Cunucu houses'],
    CW: ['Handelskade', 'Papiamento', 'Dushi', 'Floating Market', 'Blue Curaçao', 'Carnival'],
    BQ: ['Bonaire', 'Saba', 'St. Eustatius', 'Diving', 'Flamingos', 'Unspoiled nature'],
    
    // Continental Caribbean
    GY: ['Kaieteur Falls', 'Pepperpot', 'Mashramani', 'Giant Otter', 'Rupununi', 'El Dorado', 'Cricket', 'Demerara'],
    SR: ['Paramaribo', 'Dutch heritage', 'Maroon culture', 'Central Suriname Nature Reserve', 'Kaseko'],
    GF: ['French Guiana', 'Space Centre', 'Amazon', 'Carnival', 'French heritage', 'Devil\'s Island'],
    BZ: ['Barrier Reef', 'Maya ruins', 'Garifuna', 'Punta', 'Blue Hole', 'Kriol', 'Rice and beans', 'Howler monkey'],
    
    // Other Caribbean
    BS: ['Junkanoo', 'Bahama Mama', 'Swimming Pigs', 'Conch', 'Rake and Scrape', 'Flamingos', 'Andros'],
    TC: ['Conch', 'Grace Bay', 'Turks Head Cactus', 'Salt industry', 'Providenciales'],
    KY: ['Seven Mile Beach', 'Stingrays', 'Turtles', 'Pirates', 'Banking', 'Blue Iguana'],
    BM: ['Pink sand', 'Bermuda shorts', 'Gombey', 'Cricket', 'Fish chowder', 'Longtail bird'],
};

// Island Names mapping
const ISLAND_NAMES: Record<Island, string> = {
    ALL: 'Pan-Caribbean',
    // Greater Antilles
    JM: 'Jamaica',
    HT: 'Haiti',
    DO: 'Dominican Republic',
    CU: 'Cuba',
    PR: 'Puerto Rico',
    // Leeward Islands
    AG: 'Antigua & Barbuda',
    AI: 'Anguilla',
    KN: 'St. Kitts & Nevis',
    MS: 'Montserrat',
    VG: 'British Virgin Islands',
    VI: 'US Virgin Islands',
    SX: 'Sint Maarten',
    MF: 'Saint Martin',
    BL: 'St. Barthélemy',
    GP: 'Guadeloupe',
    // Windward Islands
    DM: 'Dominica',
    MQ: 'Martinique',
    LC: 'St. Lucia',
    VC: 'St. Vincent & Grenadines',
    GD: 'Grenada',
    BB: 'Barbados',
    // Southern Caribbean
    TT: 'Trinidad & Tobago',
    AW: 'Aruba',
    CW: 'Curaçao',
    BQ: 'Caribbean Netherlands',
    // Continental Caribbean
    GY: 'Guyana',
    SR: 'Suriname',
    GF: 'French Guiana',
    BZ: 'Belize',
    // Other Caribbean
    BS: 'The Bahamas',
    TC: 'Turks & Caicos',
    KY: 'Cayman Islands',
    BM: 'Bermuda',
};

const CURRICULUM_TOPICS: Record<Subject, Record<AgeBand, string[]>> = {
    literacy: {
        '3-4': ['Letter recognition', 'Phonics basics', 'Rhyming words', 'Story listening', 'Picture books'],
        '5-6': ['Sight words', 'Simple sentences', 'Reading comprehension', 'Writing names', 'Storytelling'],
        '7-8': ['Paragraph writing', 'Reading fluency', 'Grammar basics', 'Creative writing', 'Book reports']
    },
    numeracy: {
        '3-4': ['Counting 1-10', 'Shapes', 'Colors', 'Sorting', 'Patterns', 'Big/Small'],
        '5-6': ['Counting to 100', 'Addition', 'Subtraction', 'Measurement', 'Time', 'Money basics'],
        '7-8': ['Multiplication', 'Division', 'Fractions', 'Word problems', 'Geometry', 'Data handling']
    },
    science: {
        '3-4': ['Weather', 'Animals', 'Plants', 'Senses', 'Body parts', 'Day and night'],
        '5-6': ['Life cycles', 'Habitats', 'Simple machines', 'Water cycle', 'Healthy eating'],
        '7-8': ['Ecosystems', 'Energy', 'Matter', 'Earth science', 'Human body systems']
    },
    social_studies: {
        '3-4': ['Family', 'Community helpers', 'My home', 'Feelings', 'Rules'],
        '5-6': ['Maps', 'Caribbean islands', 'Traditions', 'Jobs', 'Transportation'],
        '7-8': ['Caribbean history', 'Government', 'Trade', 'Independence', 'Famous Caribbeans']
    },
    art: {
        '3-4': ['Drawing', 'Painting', 'Collage', 'Play dough', 'Finger painting'],
        '5-6': ['Caribbean patterns', 'Nature art', 'Mask making', 'Weaving basics'],
        '7-8': ['Caribbean artists', 'Pottery', 'Textile arts', 'Sculpture', 'Art history']
    },
    music: {
        '3-4': ['Nursery rhymes', 'Action songs', 'Rhythm', 'Instruments', 'Dancing'],
        '5-6': ['Caribbean songs', 'Beat patterns', 'Steelpan intro', 'Folk songs'],
        '7-8': ['Music history', 'Calypso', 'Reggae', 'Composition', 'Reading music']
    },
    caribbean_culture: {
        '3-4': ['Island names', 'Tropical fruits', 'Animals', 'Foods', 'Family words'],
        '5-6': ['Festivals', 'Traditional dress', 'Folklore', 'National symbols', 'Games'],
        '7-8': ['History', 'Independence', 'Famous people', 'Diaspora', 'Languages']
    },
    language_arts: {
        '3-4': ['Vocabulary', 'Speaking', 'Listening', 'Songs', 'Poems'],
        '5-6': ['Conversation', 'Presentations', 'Drama', 'Poetry', 'Dialect awareness'],
        '7-8': ['Creative writing', 'Public speaking', 'Debate', 'Journalism', 'Translation']
    }
};

export async function generateEducationalContent(request: ContentRequest): Promise<GeneratedContent> {
    const themes = CARIBBEAN_THEMES[request.island] || CARIBBEAN_THEMES.ALL;
    const topics = CURRICULUM_TOPICS[request.subject]?.[request.ageBand] || [];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    const selectedTopic = request.topic || topics[Math.floor(Math.random() * topics.length)];

    const ageDescriptions: Record<AgeBand, string> = {
        '3-4': 'preschool/nursery (ages 3-4), using simple language, lots of visuals, and hands-on activities',
        '5-6': 'kindergarten/infant school (ages 5-6), with basic reading, simple instructions, and guided activities',
        '7-8': 'primary school (ages 7-8), with age-appropriate complexity, independent activities, and critical thinking'
    };

    const categoryInstructions: Record<ContentCategory, string> = {
        worksheet: 'Create a printable worksheet with clear sections, exercises, and space for answers. Include tracing, matching, fill-in-the-blank, or drawing activities as appropriate.',
        coloring: 'Design a coloring page with clear outlines featuring Caribbean elements. Describe the scene and elements to be colored. Include hidden learning elements like letters or numbers.',
        activity: 'Create an interactive activity with step-by-step instructions. Include variations for different skill levels and group/individual options.',
        craft: 'Design a simple craft project using basic materials (paper, scissors, glue, crayons). Include a materials list and illustrated steps.',
        game: 'Create a fun learning game with clear rules, objectives, and Caribbean theming. Include variations and extension activities.',
        song: 'Write an original educational song with Caribbean rhythm/melody suggestions. Include actions/movements and learning objectives woven into lyrics.',
        story: 'Write a short story featuring Caribbean settings, characters, and culture. Include comprehension questions and discussion points.',
        flashcard: 'Create a set of flashcards with vocabulary, math facts, or concepts. Include both the front (question/image) and back (answer) content.'
    };

    const prompt = `You are an expert Caribbean early childhood educator creating content for Likkle Legends, an app for Caribbean and diaspora children.

CREATE: A ${request.category} for ${ageDescriptions[request.ageBand]}

SUBJECT: ${request.subject.replace('_', ' ')}
TOPIC: ${selectedTopic}
CARIBBEAN CONTEXT: Incorporate ${selectedTheme} from ${getIslandName(request.island)}
DIALECT: ${request.dialectMode === 'local' ? 'Include appropriate local dialect/Creole expressions with standard English translations' : 'Use standard English appropriate for international diaspora children'}

${categoryInstructions[request.category]}

${request.includeTeacherNotes ? 'INCLUDE TEACHER NOTES: Add a section with teaching tips, differentiation strategies, and assessment suggestions.' : ''}

RESPOND IN THIS EXACT JSON FORMAT:
{
    "title": "Engaging title for the content",
    "description": "Brief 1-2 sentence description",
    "instructions": "Clear step-by-step instructions for completing the activity",
    "content": "The main content - for worksheets include HTML structure, for stories the full text, for crafts detailed instructions, etc.",
    "teacherNotes": "Teaching tips and suggestions (if requested)",
    "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
    "materials": ["Material 1", "Material 2"],
    "duration": "Estimated time to complete",
    "difficulty": "easy|medium|challenging",
    "caribbeanContext": "Brief explanation of the Caribbean cultural connection",
    "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const response = await generateContent(prompt);
    
    try {
        const jsonStr = response.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonStr) as GeneratedContent;
        return parsed;
    } catch {
        return {
            title: `${selectedTopic} - ${request.category}`,
            description: `A ${request.category} about ${selectedTopic} for ages ${request.ageBand}`,
            instructions: response,
            content: response,
            learningObjectives: [`Learn about ${selectedTopic}`],
            difficulty: 'medium',
            caribbeanContext: `Features ${selectedTheme} from the Caribbean`,
            keywords: [selectedTopic, selectedTheme, request.subject]
        };
    }
}

export function getIslandName(code: Island): string {
    return ISLAND_NAMES[code] || 'the Caribbean';
}

export { CARIBBEAN_THEMES, CURRICULUM_TOPICS, ISLAND_NAMES };
