const isAuthenticated = (req, res, next) => {
  if(!req.session.user){
    res.redirect('/login')
    return;
  }
  next();
}

const isNotAuthenticated = (req, res, next) => {
  if(req.session.user){
    res.redirect('/profile');
    return;
  }
  next();
}

module.exports = {
  isAuthenticated,
  isNotAuthenticated
}