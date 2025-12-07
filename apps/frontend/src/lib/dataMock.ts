/**
 * Sistema de Dados Mock (100% Frontend)
 * Fornece dados simulados para todas as páginas sem usar API
 */

// Dados mock para todas as funcionalidades
export const mockData = {
  // Estatísticas
  statistics: {
    systemHealth: 98,
    activeUsers: 120,
    connectedSchools: 5,
    responseTimeMsP95: 120,
    resourcesUsage: { cpu: 35, memory: 48 },
    engagement: { dailyActive: 80, weeklyActive: 220 },
    errorsLastHour: 1,
  },

  // Tesouraria
  treasury: {
    overview: {
      totalInvoices: 45,
      overdue: 3,
      paid: 38,
      receita: 15750.00,
    },
    invoices: [],
    cashflow: {
      receita: 15750.00,
      despesa: 8500.00,
      saldo: 7250.00,
      entries: [],
    },
  },

  // Secretaria
  secretary: {
    students: [],
    classes: [],
    subjects: [],
  },

  // Educação
  education: {
    dashboard: {
      totalEscolas: 49,
      totalAlunos: 0,
      totalProfessores: 12,
      mediaGeral: 7.6,
      taxaAprovacao: 0.82,
      indiceFrequencia: 0.91,
      evasaoPercent: 0.03,
      idebScore: 5.2,
    },
    schools: [],
  },

  // Professor
  teacher: {
    terms: [
      { id: "term1", number: 1, status: "active", startDate: "2025-02-01", endDate: "2025-03-31" },
      { id: "term2", number: 2, status: "locked", startDate: "2025-04-01", endDate: "2025-05-31" },
      { id: "term3", number: 3, status: "locked", startDate: "2025-06-01", endDate: "2025-07-31" },
      { id: "term4", number: 4, status: "locked", startDate: "2025-08-01", endDate: "2025-09-30" },
    ],
    classes: [],
    subjects: [],
    students: [],
    lessons: [],
    attendance: {},
    grades: {},
  },

  // Aluno
  student: {
    me: {
      id: "s1",
      name: "Ana Silva",
      matricula: "2025-0001",
      classId: "c7A",
      photoUrl: null,
    },
    reportCard: [],
    attendance: [],
    assignments: [],
    pedacoins: {
      balance: 30,
      ledger: [],
    },
  },
};

/**
 * Função helper para simular delay de API
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retorna dados mock com delay simulado
 */
export async function getMockData<T>(key: keyof typeof mockData, delayMs: number = 300): Promise<T> {
  await delay(delayMs);
  return mockData[key] as T;
}




