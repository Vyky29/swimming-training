(function(){
  function markReviewed(el){
    if(!el) return;
    el.classList.add('clicked');
  }

  document.addEventListener('click', function(event){
    var keyIdea = event.target.closest('.key-idea-item');
    if(keyIdea){
      markReviewed(keyIdea);
    }
  });

  document.addEventListener('keydown', function(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    var keyIdea = event.target.closest('.key-idea-item');
    if(!keyIdea) return;
    event.preventDefault();
    markReviewed(keyIdea);
  });
})();
