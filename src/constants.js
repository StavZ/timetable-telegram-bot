export default {
  groups: {
    'Компьюторные системы и комплексы': [
      'КС-18/1к, КС-18/2к',
      'КС-19',
      'КС-19к',
      'КС-20/1, КС-20/1к',
      'КС-20/2, КС-20/2к',
      'КС-20/3к, КС-20/4к',
      'КС-21/1, КС-21/1к',
      'КС-21/2, КС-21/2к',
      'КС-21/3к'
    ],
    'Сетевое и системное администрирование': [
      'СА-18к',
      'СА-19, СА-19к',
      'СА-20, СА-20к',
      'СА-21, СА-21к',
      'СА/ТД-21к'
    ],
    'Сварщик': [
      'Св-19', 'Св-20',
      'Св-21', 'Св-21к'
    ],
    'Сварочное производство': [
      'Т-18/1, Т-18/1к',
      'Т-18/2, Т-18/2к',
      'Т-19/1, Т-19/1к',
      'Т-19/2, Т-19/2к',
      'Т-20/1, Т-20/1к',
      'Т-20/2, Т-20/2к',
      'Т-20к',
      'Т-21/1, Т-21/1к',
      'Т-21/2, Т-21/2к'
    ],
    'Технология машиностроения': [
      'ТМ-18/1, ТМ-18/1к',
      'ТМ-18/2, ТМ-18/2к',
      'ТМ-19/1, ТМ-19/1к',
      'ТМ-19/2, ТМ-19/2к',
      'ТМ-20/1, ТМ-20/1к',
      'ТМ-20/2, ТМ-20/2к',
      'ТМ-21/1, ТМ-21/1к',
      'ТМ-21/2, ТМ-21/2к'
    ],
    'Специальные машины и устройства': [
      'УМ-18, УМ-18к',
      'УМ-19, УМ-19к',
      'УМ-20, УМ-20к',
      'УМ-21, УМ-21к'
    ],
    'Управление качеством продукции, процессов и услуг': [
      'УП-21, УП-21к'
    ],
    'Электромонтер': [
      'Эл-19', 'Эл-20, Эл-20к',
      'Эл-21, Эл-21к'
    ],
    'Техническое обслуживание и ремонт двигателей, систем и агрегатов автомобилей': [
      'СА/ТД-21к'
    ],
    'Техническое обслуживание и ремонт автомобильного транспорта': [
      'ТО-18, ТО-18к',
      'ТО-19, ТО-19к',
      'ТО-20, ТО-20к',
      'ТО-20/1к'
    ],
    'Техническое регулирование и управление качеством': [
      'УК-18, УК-18к',
      'УК-19, УК-19к',
      'УК-20, УК-20к'
    ]
  },
  groupIds: {
    'Компьюторные системы и комплексы': 'КС',
    'Сетевое и системное администрирование': 'СА',
    'Сварщик': 'Св',
    'Сварочное производство': 'Т',
    'Технология машиностроения': 'ТМ',
    'Специальные машины и устройства': 'УМ',
    'Управление качеством продукции, процессов и услуг': 'УП',
    'Электромонтер': 'Эл',
    'Техническое обслуживание и ремонт двигателей, систем и агрегатов автомобилей': 'ТД',
    'Техническое обслуживание и ремонт автомобильного транспорта': 'ТО',
    'Техническое регулирование и управление качеством': 'УК'
  },
  specialties: {
    'Компьюторные системы и комплексы': {
      prefix: 'КС',
      maxCourses: 4
    },
    'Сетевое и системное администрирование': {
      prefix: 'СА',
      maxCourses: 4
    },
    'Сварщик': {
      prefix: 'Св',
      maxCourses: 3
    },
    'Сварочное производство': {
      prefix: 'Т',
      maxCourses: 4
    },
    'Технология машиностроения': {
      prefix: 'ТМ',
      maxCourses: 4
    },
    'Специальные машины и устройства': {
      prefix: 'УМ',
      maxCourses: 4
    },
    'Управление качеством продукции, процессов и услуг': {
      prefix: 'УП',
      maxCourses: 4
    },
    'Электромонтер': {
      prefix: 'Эл',
      maxCourses: 3
    },
    'Техническое обслуживание и ремонт двигателей, систем и агрегатов автомобилей': {
      prefix: 'ТД',
      maxCourses: 4
    },
    'Техническое обслуживание и ремонт автомобильного транспорта': {
      prefix: 'ТО',
      maxCourses: 4
    },
    'Техническое регулирование и управление качеством': {
      prefix: 'УК',
      maxCourses: 4
    }
  },
  courses: {
    '21': 1,
    '20': 2,
    '19': 3,
    '18': 4,
    1: '21',
    2: '20',
    3: '19',
    4: '18'
  }
}