import React from 'react';
import ActivityPage from './ActivityPage'; 
import { Dumbbell } from 'lucide-react'; 

const exerciseData = {
    title: "Exercício",
    unit: "min",
    current: 15,
    goal: 30,
    addButtons: [10, 15, 30],
    AddIcon: Dumbbell, 
    historyTime: [
        { time: "09:00", value: 10 },
        { time: "11:30", value: 10 }
    ],
    historyDate: [
        { date: "01/09/2025", percentage: 100 },
        { date: "31/08/2025", percentage: 70 },
        { date: "30/08/2025", percentage: 45 },
        { date: "29/08/2025", percentage: 100 }
    ]
};

const ExercisePage: React.FC = () => {
    return <ActivityPage {...exerciseData} />;
};

export default ExercisePage;