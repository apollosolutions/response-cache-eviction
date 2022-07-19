import { Drug, DrugSchedule, Resolvers } from '../../types/generated/graphql'
import { DateResolver } from 'graphql-scalars'
import { DrugDao } from '../../types'

const daoToDrug = (dao: DrugDao): Drug => {
  return {
    id: dao.id,
    brandName: dao.brand_name,
    genericName: dao.generic_name,
    drugClass: dao.drug_class,
    schedule: dao.schedule?.replace('-', '_') as DrugSchedule,
    releasedOn: dao.released_on,
  }
}

const resolvers: Resolvers = {
  Date: DateResolver,
  Query: {
    top200Drugs: async (_root, _args, cxt, _info) => {
      return (await cxt.dataSources.drugApi.getDrugs()).map(daoToDrug)
    },
    randomDrug: async (_root, _args, cxt, _info) => {
      const randomNum = Math.floor(Math.random() * 200)
      const drugDao = await cxt.dataSources.drugApi.getDrugById(randomNum)
      return daoToDrug(drugDao)
    },
    drugById: async (_root, { id }, cxt, _info) => {
      return daoToDrug(await cxt.dataSources.drugApi.getDrugById(id))
    },
  },
}

export default resolvers
