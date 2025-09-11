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

// Original select without project relation
export const projectAreaFullSelect = {
  include: {
    lineItemGroups: lineItemGroupFullSelect
  }
}

// New select with project relation for duplicate operations
export const projectAreaWithProjectSelect = {
  include: {
    lineItemGroups: lineItemGroupFullSelect,
    project: {
      include: {
        users: true,
        clients: true,
        stars: true
      }
    }
  }
}
