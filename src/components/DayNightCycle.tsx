'use client';

import { useEffect, useState } from 'react';

export default function DayNightCycle() {
    const [theme, setTheme] = useState('night'); // default

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            let newTheme = 'night';

            if (hour >= 6 && hour < 12) newTheme = 'morning';
            else if (hour >= 12 && hour < 17) newTheme = 'noon';
            else if (hour >= 17 && hour < 20) newTheme = 'evening';
            else newTheme = 'night';

            setTheme(newTheme);
            document.body.setAttribute('data-theme', newTheme);
        };

        updateTheme();
        const interval = setInterval(updateTheme, 300000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return null; // No UI, just effect
}
