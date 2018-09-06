exports.validatePollsLength = polls => {
  return polls.length > 0;
}

// exports.candidateNameUnique = async ({name, model}) => {
//   const docs = await model.find({name});
//   return docs.length == 0;
// }