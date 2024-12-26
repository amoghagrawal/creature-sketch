export default async function handler(req, res) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_KEY) {
        return res.status(500).json({ error: "API key not configured." });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const { description, isInsectMode } = req.body;

    if (!description) {
        return res.status(400).json({ error: "Description is required." });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: `Create a detailed ${isInsectMode ? 'insect' : 'animal'} description based on this input: "${description}".
                            
                            Respond with a JSON object using this structure:
                            {
                                "name": "A creative name for the creature",
                                "scientificName": "A scientific-sounding Latin name",
                                "description": "A detailed physical description of the creature",
                                ${isInsectMode ? `"quirks": "Unique behavioral quirks and adaptations",` : `"habitat": "The natural environment where it lives",`}
                                "behavior": "How the creature typically behaves",
                                "abilities": "Special abilities or notable features",
                                "specialProperties": "Any additional unique characteristics"
                            }
                            
                            Important guidelines:
                            - Every field must be filled with relevant content
                            - Description should be 2-3 sentences minimum
                            - Make it scientifically plausible but with fantastical elements
                            - Include vivid sensory details
                            - Each field should have complete sentences.`
                    }
                ]
            })
        });

        const responseData = await response.json();

        const data = JSON.parse(responseData.choices[0].message.content);

        const requiredFields = ['name', 'scientificName', 'description', 'behavior', 'abilities', 'specialProperties'];
        if (isInsectMode) requiredFields.push('quirks');
        else requiredFields.push('habitat');

        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new Error(`Invalid response: Missing ${missingFields.join(', ')}`);
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: "Failed to generate creature description.", details: error.message });
    }
}
