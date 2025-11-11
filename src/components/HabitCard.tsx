import React from 'react';
import '../styles/HabitCard.css';
import type { LucideIcon } from 'lucide-react'; 

interface HabitCardProps {
    Icon: LucideIcon;
    title: string;
    current: string | number;
    goal: string | number;
    unit: string;
}

const HabitCard: React.FC<HabitCardProps> = ({ Icon, title, current, goal, unit }) => {
    return (
        <div className="habit-card">
            <div className="habit-icon">
                <Icon size={32} />
            </div>
            <div className="habit-info">
                <span className="habit-title">{title}</span>
                <span className="habit-progress">
                    {current}{unit} / <strong>{goal}{unit}</strong>
                </span>
            </div>
        </div>
    );
};

export default HabitCard;