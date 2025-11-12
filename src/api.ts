// src/api.ts
import { Droplet, Dumbbell, Bed, Brain, Utensils, BookOpen, type LucideIcon } from 'lucide-react';

export interface ActivityData {
    slug: string;
    title: string;
    unit: string;
    current: number;
    goal: number;
    addButtons: number[];
    Icon: LucideIcon;
    historyTime: { time: string; value: number }[];
    historyDate: { date: string; percentage: number }[];
}

// Nosso banco de dados falso
const allActivities: Record<string, ActivityData> = {
    hidratacao: {
        slug: "hidratacao",
        title: "Hidratação",
        unit: "ml",
        current: 1200,
        goal: 2400,
        addButtons: [100, 250, 500],
        Icon: Droplet,
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
    },
    exercicio: {
        slug: "exercicio",
        title: "Exercício",
        unit: "min",
        current: 15,
        goal: 30,
        addButtons: [10, 15, 30],
        Icon: Dumbbell,
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
    },
    sono: {
        slug: "sono",
        title: "Sono",
        unit: "horas",
        current: 6,
        goal: 8,
        addButtons: [5, 10, 15],
        Icon: Bed,
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
    },
    meditacao: {
        slug: "meditacao",
        title: "Meditação",
        unit: "min",
        current: 15,
        goal: 30,
        addButtons: [10, 15, 30],
        Icon: Brain,
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
    },
    alimentacao: {
        slug: "alimentacao",
        title: "Alimentação",
        unit: "un",
        current: 1,
        goal: 3,
        addButtons: [10, 15, 30],
        Icon: Utensils,
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
    },
    estudo: {
        slug: "estudo",
        title: "Estudo",
        unit: "min",
        current: 15,
        goal: 30,
        addButtons: [10, 15, 30],
        Icon: BookOpen,
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
    },
};

// Função que simula a busca no backend
export const fetchActivityData = (slug: string): Promise<ActivityData | null> => {
    return new Promise((resolve) => {
        // Simula a demora da rede
        setTimeout(() => {
            if (allActivities[slug]) {
                resolve(allActivities[slug]);
            } else {
                resolve(null); // Rotina não encontrada
            }
        }, 300); // 300ms de delay
    });
};