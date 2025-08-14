import { ITTFormData, ProjectFormData } from './types'

export const defaultITTFormData: ITTFormData = {
  project: "",
  category: "",
  scope: "",
  budget: "",
  deadline: "",
  region: "all",
  suppliers: [],
  materials: [],
  quantities: {},
  specialRequirements: "",
  compliance: [],
  description: ""
}

export const defaultProjectFormData: ProjectFormData = {
  name: "",
  location: "",
  country: "",
  startDate: "",
  endDate: "",
  description: "",
  budget: "",
  size: "",
  template: "",
  materials: [],
  tradeCategories: [],
  specialRequirements: "",
  compliance: [],
  team: [],
  autoGenerateITT: false,
  createTeamsChannel: false,
  setupFolders: false
}