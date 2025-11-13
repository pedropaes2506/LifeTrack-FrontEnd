import { Droplet, Dumbbell, Bed, Brain, Utensils, BookOpen, Clock, type LucideIcon } from 'lucide-react';

// Mapeamento de ENUM do banco para Ícones
export const IconMap: { [key: string]: LucideIcon } = {
    'Hidratação': Droplet,
    'Exercício': Dumbbell,
    'Sono': Bed,
    'Meditação': Brain,
    'Alimentação': Utensils,
    'Estudo': BookOpen,
    'Padrão': Clock, // Para qualquer rotina não mapeada
};

export const getIcon = (nome: string): LucideIcon => {
    // Retorna o ícone mapeado com base no nome da rotina, ou um ícone padrão (Clock)
    return IconMap[nome] || IconMap['Padrão'];
};