import { Drug, DrugSchedule, Resolvers } from '../../types/generated/graphql'
import { DateResolver } from 'graphql-scalars'
import { DrugDao } from '../../types'

const daoToDrug = (dao: DrugDao): Drug => {
  return {
    id: dao.id,
    brandName: dao.brand_name,
    genericName: dao.generic_name,
    drugClass: dao.drug_class,
    schedule: dao.schedule as DrugSchedule,
    releasedOn: dao.released_on,
    stock: {
      pillsInStock: dao.pills_in_stock,
      maxPillStockCount: dao.max_pill_stock_capacity,
    },
  }
}

const resolvers: Resolvers = {
  Date: DateResolver,
  Mutation: {
    setDrugStock: async (
      _root,
      { input: { drugId, pillCount } },
      cxt,
      _info,
    ) => {
      const res = await cxt.dataSources.drugApi.setPillCountForDrug(
        drugId,
        pillCount,
      )

      const keys = await cxt.cacheEvictor.deleteByPrefixes('Schedule[23]')

      console.log('Keys evicted:', keys)

      return {
        success: true,
        drugId: res[0].drug_id,
        pillCount: res[0].pills_in_stock,
      }
    },
  },
  Query: {
    allDrugs: async (_root, { filter }, cxt, _info) => {
      if (filter) {
        const drugs = (
          await cxt.dataSources.drugApi.getDrugsBySchedule(filter.schedules)
        ).map(daoToDrug)
        return drugs
      }
      const drugs = (await cxt.dataSources.drugApi.getDrugs()).map(daoToDrug)
      return drugs
    },
    drugById: async (_root, { id }, cxt, _info) => {
      return daoToDrug(await cxt.dataSources.drugApi.getDrugById(id))
    },
  },
}

export default resolvers
