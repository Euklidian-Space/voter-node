exports.validateCandidatesLength = candidates => {
  return candidates.length >= 2;
};

exports.validateUniqueNames = candidates => {
  const names = candidates.map(c => c.name);
  let name_count = names.reduce((result, name) => {
    if (result[name]) {
      result[name] += 1;
    } else {
      result[name] = 1;
    }
    return result;
  }, {});

  return Math.max(...Object.values(name_count)) <= 1;
};