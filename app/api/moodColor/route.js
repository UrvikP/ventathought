import { NextResponse } from "next/server";

// Define a color mapping inspired by 
// Plutchik's Wheel of Emotions

const colorMapping = {
    /*
    "angry": [245, 24, 5]        // RED
    "worried": [147, 79, 14]     // brown
    "confused": [244, 202, 109]  
    "nervous": [245, 172, 68]
    "terrified": [155, 141, 13]
    "happy": [245, 242, 110]
    "excited": [252, 246, 84]
    "afraid": [86, 130, 0]
    "sad": [1, 113, 192]
    "relaxed": [87, 201, 215]
    "grief": [25, 112, 125]
    "dissapointment": [59, 80, 155]
    "bored": [227, 155, 201]
    "bitter": [123, 18, 84]
    "irritated": [166, 33, 89]
    "hurt": [119, 24, 80]
    */
    "loved": [200, 60, 60, 1],
    "anger": [125, 40, 40, -1],
    "optimistic": [210, 75, 165, 1],
    "anxous": [80, 40, 100, -1],
    "sad": [60, 50, 120, -1],
    "jealous": [40, 90, 45, -2],
    "happy": [230, 245, 80, 1],
    "concerned": [125, 85, 50, -1],
    "bitter": [54, 110, 70, -1],
    "bored": [140, 200, 200, -1]
};

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export async function POST(req) {
    const { moods } = await req.json();

    const colors = moods.map(mood => {
        const lowerCaseMood = mood.toLowerCase();
        if (lowerCaseMood in colorMapping) {
            const [r, g, b] = colorMapping[lowerCaseMood];
            return rgbToHex(r, g, b);
        } else {
            // Return a default color if mood is not found
            return "#808080"; // Gray
        }
    });

    return NextResponse.json({ colors });
}












