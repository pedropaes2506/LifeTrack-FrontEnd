import React from 'react';
import ActivityPage from './ActivityPage'; 
import { Droplet } from 'lucide-react'; 

const hydrationData = {
    title: "Hidratação",
    unit: "ml",
    current: 1200,
    goal: 2400,
    addButtons: [100, 250, 500],
    AddIcon: Droplet,
    historyTime: [
        { time: "09:00", value: 250 },
        { time: "11:30", value: 100 }
    ],
    historyDate: [
        { date: "01/09/2025", percentage: 100 },
        { date: "31/08/2025", percentage: 70 },
        { date: "30/08/2025", percentage: 45 },
        { date: "29/08/2025", percentage: 100 }
    ]
};

const HydrationPage: React.FC = () => {
    return <ActivityPage {...hydrationData} />;
};

export default HydrationPage;