import { DrugAPI } from './DrugApi'

const dataSources = {
  drugApi: new DrugAPI(),
}

export default () => dataSources
