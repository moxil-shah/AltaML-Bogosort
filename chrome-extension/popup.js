document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.form-control-range');
  
    sliders.forEach(function(slider) {
      const labelId = `${slider.id}Label`;
      console.log(labelId);
      const label = document.getElementById(labelId);
  
      slider.addEventListener('input', function() {
        const sliderValue = slider.value;
        label.textContent = `${slider.id} | ${sliderValue}%`;
      });
    });
  });
  