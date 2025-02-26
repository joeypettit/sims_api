export const optionTierFullSelect = {
  select: {
    name: true,
    tierLevel: true,
  },
}

export const lineItemOptionFullSelect = {
  include: {
    optionTier: optionTierFullSelect
  }
}

export const lineItemFullSelect = {
  include: {
    lineItemOptions: lineItemOptionFullSelect,
    unit: {
      select: {
        id: true,
        name: true
      }
    }
  }
}


export const lineItemGroupFullSelect = {
  include: {
    lineItems: lineItemFullSelect,
  }
}


export const projectAreaFullSelect = {
  include: {
    lineItemGroups: lineItemGroupFullSelect
  }
}
