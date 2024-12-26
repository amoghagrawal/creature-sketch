export default async function handler(req, res) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_KEY) {
        return res.status(500).json({ error: "API key not configured." });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const { creature1, creature2, isInsectMode } = req.body;

    if (!creature1 || !creature2) {
        return res.status(400).json({ error: "Both creatures are required." });
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
                        content: `Create a hybrid description by combining aspects of these two ${isInsectMode ? 'insects' : 'animals'}:
                        Creature 1: ${JSON.stringify(creature1)}
                        Creature 2: ${JSON.stringify(creature2)}
                        
                        Create a hybrid ${isInsectMode ? 'insect' : 'animal'} that combines the most interesting features of both creatures.
                        Follow the same JSON structure as the original creatures.
                        Make sure the combination is creative but still somewhat biologically plausible.`
                    }
                ]
            })
        });

        const responseData = await response.json();
        const hybridCreature = JSON.parse(responseData.choices[0].message.content);

        const requiredFields = ['name', 'scientificName', 'description', 'behavior', 'abilities', 'specialProperties'];
        if (isInsectMode) requiredFields.push('quirks');
        else requiredFields.push('habitat');

        const missingFields = requiredFields.filter(field => !hybridCreature[field]);
        if (missingFields.length > 0) {
            throw new Error(`Invalid response: Missing ${missingFields.join(', ')}`);
        }

        res.status(200).json(hybridCreature);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: "Failed to combine creatures.", details: error.message });
    }
}
