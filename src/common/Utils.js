const URL_PARAMS = new URLSearchParams(window.location.search)

// GET URL PARAMETER KEY
const parameterEnabled = key => {
  const param = URL_PARAMS.get(key)

  return (param === null || param === 'false') ? false : param || true
}

// GET RANDOM FLOAT BETWEEN MIN AND MAX
const randomFloat = (min, max) => Math.random() * (max - min) + min

export { parameterEnabled, randomFloat }