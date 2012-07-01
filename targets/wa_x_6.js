/*
 * jArcherTarget version 0.1.0
 * 
 *
 * Copyright 2012, Andre Meyering
 * Licensed under the MIT license.
 *
 */
(function ($) {
    
    $.fn.archerTarget('addTarget', 'wa_x_6', {
        numberRings: 6,
        colors: ['#3aa3d9', '#f16e7a', '#f16e7a', '#f6e42e', '#f6e42e', '#f6e42e'],
        strokeColors: ['#3f3f3f', '#3f3f3f', '#3f3f3f', '#3f3f3f', '#3f3f3f', '#3f3f3f'],
        rating: ['6', '7', '8', '9', '10', 'X'],
        diameters: [100, 80, 60, 40, 20, 7]
    });

})(jQuery);
