exports.getOverview = (req, res) => {
  res.status(200).render('overview', {
    tour: 'Wine taster',
    user: 'govind',
  });
};

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'Wine taster',
  });
};
