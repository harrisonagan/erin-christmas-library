import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pb, getBookCoverUrl } from './lib/pocketbase';
import { saveBooksToIndexedDB, getBooksFromIndexedDB } from './lib/idbStorage';
import {
  isFirebaseConfigured,
  subscribeToBooksFromCloud,
  deleteBookFromCloud,
  saveBookToCloud,
  signInWithGoogle,
  signOutGoogle,
  subscribeToAuthChanges,
  checkGoogleRedirectResult,
  isAuthorizedUser,
} from './lib/firebase';
import CabinLanding from './components/CabinLanding';
import SpineBookshelf, { isMouseBookItem, isMagazineItem } from './components/SpineBookshelf';
import CoverGalleryView from './components/CoverGalleryView';
import ListView from './components/ListView';
import ReaderModal from './components/ReaderModal';
import AddBookModal from './components/AddBookModal';
import CloudBackupModal from './components/CloudBackupModal';
import CookbookView from './components/CookbookView';

// Curated Authentic Family Christmas Library (109 Volumes from Family Collection)
const INITIAL_BOOKS = [
  { 
    id: '1', 
    title: 'Mice Skating', 
    author: 'Annie Silvestro', 
    category: 'story',
    isMouseBook: true,
    cover: '/covers/mice-skating.webp?v=5',
    notes: 'Illustrated by Teagan White • A cozy winter favorite',
    pages: [] 
  },
  { 
    id: 'santas_moose', 
    title: "Santa's Moose", 
    author: 'Syd Hoff', 
    category: 'story',
    cover: '/covers/santas-moose.webp?v=5',
    notes: 'An Early I Can Read Book • A classic holiday tale',
    pages: [] 
  },
  { 
    id: 'the_mitten', 
    title: 'The Mitten', 
    author: 'Jan Brett', 
    category: 'story',
    cover: '/covers/the-mitten.webp?v=5',
    notes: 'Adapted and illustrated by Jan Brett • Ukrainian Folktale',
    pages: [] 
  },
  { 
    id: 'one_snowy_night', 
    title: 'One Snowy Night', 
    author: 'M. Christina Butler', 
    category: 'story',
    cover: '/covers/one-snowy-night.webp?v=5',
    notes: 'Illustrated by Tina Macnaughton • A Touch-and-Feel Book',
    pages: [] 
  },
  { 
    id: 'night_before_christmas', 
    title: 'The Night Before Christmas', 
    author: 'Clement C. Moore', 
    category: 'story',
    cover: '/covers/the-night-before-christmas.webp?v=7',
    notes: 'Illustrations by Tom Browning • Read every Christmas Eve',
    pages: [] 
  },
  { 
    id: 'chickadees_in_december', 
    title: 'Chickadees In December', 
    author: 'Bill O. Smith', 
    category: 'story',
    cover: '/covers/chickadees-in-december.webp?v=7',
    notes: 'Illustrated by Charles R. Murphy • Heartwarming winter story',
    pages: [] 
  },
  { 
    id: 'santa_in_michigan', 
    title: 'Santa is Coming to Michigan', 
    author: 'Steve Smallman', 
    category: 'story',
    cover: '/covers/santa-is-coming-to-michigan.webp?v=5',
    notes: 'Illustrated by Robert Dunn and Jim Mitchell • Great Lakes holiday adventure',
    pages: [] 
  },
  { 
    id: 'mr_willowbys_christmas_tree', 
    title: "Mr. Willowby's Christmas Tree", 
    author: 'Robert Barry', 
    category: 'story',
    cover: '/covers/mr-willowbys-christmas-tree.webp?v=5',
    notes: "A Dell Yearling Classic • When Mr. Willowby's tree is too tall, the top is chopped off and shared with everyone in the forest",
    pages: [] 
  },
  { 
    id: 'the_very_first_christmas', 
    title: 'The Very First Christmas', 
    author: "The Beginner's Bible", 
    category: 'story',
    cover: '/covers/the-very-first-christmas.webp?v=7',
    notes: 'The Nativity story for young readers • Baby Jesus born in Bethlehem',
    pages: [] 
  },
  { 
    id: 'the_newborn_king', 
    title: 'The Newborn King', 
    author: 'Unknown', 
    category: 'story',
    cover: '/covers/the-newborn-king.webp?v=5',
    notes: 'Bendon Publishing • A Treasured Keepsake Board Book • The holy birth of Christ',
    pages: [] 
  },
  { 
    id: 'the_big_snow', 
    title: 'The Big Snow', 
    author: 'Berta and Elmer Hader', 
    category: 'story',
    cover: '/covers/the-big-snow.webp?v=5',
    notes: 'Winner of the Caldecott Medal • Woodland creatures preparing for winter',
    pages: [] 
  },
  { 
    id: 'the_12_bugs_of_christmas', 
    title: 'The 12 Bugs of Christmas', 
    author: 'David A. Carter', 
    category: 'story',
    cover: '/covers/the-12-bugs-of-christmas.webp?v=5',
    notes: 'A Pop-up Christmas Counting Book • Whimsical bugs singing holiday cheer',
    pages: [] 
  },
  { 
    id: 'the_nutcracker_golden', 
    title: 'The Nutcracker', 
    author: 'Unknown', 
    category: 'story',
    cover: '/covers/the-nutcracker-golden.webp?v=5',
    notes: 'A Little Golden Book Classic (#460-16) • Clara, the Nutcracker, and the Mouse King',
    pages: [] 
  },
  { 
    id: 'the_littlest_christmas_elf', 
    title: 'The Littlest Christmas Elf', 
    author: 'Unknown', 
    category: 'story',
    cover: '/covers/the-littlest-christmas-elf.webp?v=5',
    notes: 'A Little Golden Book (#459-00) • Oliver the helpful Christmas elf',
    pages: [] 
  },
  { 
    id: 'cat_family_christmas', 
    title: 'Cat Family Christmas', 
    author: 'Lucy Brownridge', 
    category: 'story',
    cover: '/covers/cat-family-christmas.webp?v=5',
    notes: 'Illustrated by Eunyoung Seo • Lift-the-flap advent book with over 140 flaps',
    pages: [] 
  },
  { 
    id: 'the_christmas_fox', 
    title: 'The Christmas Fox', 
    author: 'Anik McGrory', 
    category: 'story',
    cover: '/covers/the-christmas-fox.webp?v=5',
    notes: 'A gentle snowy forest tale of welcoming baby Jesus',
    pages: [] 
  },
  { 
    id: 'snow', 
    title: 'Snow', 
    author: 'P.D. Eastman and Roy McKie', 
    category: 'story',
    cover: '/covers/snow.webp?v=5',
    notes: 'I Can Read Beginner Books • A fun-filled snowy day adventure',
    pages: [] 
  },
  { 
    id: 'the_bears_christmas', 
    title: "The Bears' Christmas", 
    author: 'Stan and Jan Berenstain', 
    category: 'story',
    cover: '/covers/the-bears-christmas.webp?v=5',
    notes: "Beginner Books • Papa Bear tries out Small Bear's new Christmas sled, skates, and skis",
    pages: [] 
  },
  { 
    id: 'dws_perfect_present', 
    title: "D.W.'s Perfect Present", 
    author: 'Marc Brown', 
    category: 'story',
    cover: '/covers/dws-perfect-present.webp?v=5',
    notes: "Featuring Arthur • Arthur's little sister searches for the perfect Christmas gift",
    pages: [] 
  },
  { 
    id: 'the_nutcracker_popup', 
    title: 'The Nutcracker: A Christmas Pop-up', 
    author: 'Unknown', 
    category: 'story',
    cover: '/covers/the-nutcracker-popup.webp?v=5',
    notes: 'Three-dimensional holiday pop-up edition with magical scenes',
    pages: [] 
  },
  { 
    id: 'the_christmas_promise', 
    title: 'Christmas Promises', 
    author: 'Lee G. Smith', 
    category: 'story',
    cover: '/covers/the-christmas-promise.webp?v=5',
    notes: 'Illustrated by Bill Stroble • A touching Christmas story of hope and love',
    pages: [] 
  },
  { 
    id: 'the_mouse_in_the_manger', 
    title: 'The Mouse in the Manger', 
    author: 'Rev. Gennaro L. Gentile', 
    category: 'story',
    isMouseBook: true,
    cover: '/covers/the-mouse-in-the-manger.webp?v=5',
    notes: 'Art by Vernon McKissack • A heartwarming Christmas Eve tale of a humble mouse at the manger',
    pages: [] 
  },
  {
    id: 'richard_scarrys_christmas_mice',
    title: "Richard Scarry's Christmas Mice",
    author: 'Richard Scarry',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/richard-scarrys-christmas-mice.webp?v=5',
    notes: 'A Little Golden Book Classic • Holiday adventures with Richard Scarry\'s cheerful mice',
    pages: []
  },
  {
    id: 'frosty_the_snowman',
    title: 'Frosty the Snowman',
    author: 'Jack Rollins and Steve Nelson',
    category: 'story',
    cover: '/covers/frosty-the-snowman.webp?v=5',
    notes: 'Classic illustrated holiday songbook of Frosty the Snowman',
    pages: []
  },
  {
    id: 'this_little_reindeers_first_christmas',
    title: "This Little Reindeer's First Christmas",
    author: 'Unknown',
    category: 'story',
    cover: '/covers/this-little-reindeers-first-christmas.webp?v=5',
    notes: "Sweet holiday board book following a little reindeer's first Christmas",
    pages: []
  },
  {
    id: 'peace_on_earth',
    title: 'Peace on Earth',
    author: 'Jonny Marx',
    category: 'story',
    cover: '/covers/peace-on-earth.webp?v=5',
    notes: 'Illustrated by Lindsey Sagar • Heartwarming holiday storybook',
    pages: []
  },
  {
    id: 'biscuits_pet_and_play_christmas',
    title: "Biscuit's Pet & Play Christmas",
    author: 'Alyssa Satin Capucilli',
    category: 'story',
    cover: '/covers/biscuits-pet-and-play-christmas.webp?v=5',
    notes: 'A Touch & Feel Book • Festive holiday fun with Biscuit the puppy',
    pages: []
  },
  {
    id: 'christmas_pop_up_peekaboo',
    title: 'Christmas Pop-Up Peekaboo!',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/christmas-pop-up-peekaboo.webp?v=5',
    notes: 'DK Publishing • Pop-up surprise under every festive flap!',
    pages: []
  },
  {
    id: 'the_twelve_days_of_christmas_brett',
    title: 'The Twelve Days of Christmas',
    author: 'Jan Brett',
    category: 'story',
    cover: '/covers/the-twelve-days-of-christmas-brett.webp?v=5',
    notes: 'Adapted and lavishly illustrated by Jan Brett',
    pages: []
  },
  {
    id: 'room_for_a_little_one',
    title: 'Room for a Little One: A Christmas Tale',
    author: 'Martin Waddell',
    category: 'story',
    cover: '/covers/room-for-a-little-one.webp?v=5',
    notes: 'Illustrated by Jason Cockcroft • A gentle Nativity tale by the stable warmth',
    pages: []
  },
  {
    id: 'the_story_of_christmas_pingry',
    title: 'The Story of Christmas',
    author: 'Patricia A. Pingry',
    category: 'story',
    cover: '/covers/the-story-of-christmas.webp?v=5',
    notes: 'Illustrated by Rebecca Thornburgh • Board book introduction to the first Christmas',
    pages: []
  },
  {
    id: 'the_brave_little_puppy',
    title: 'The Brave Little Puppy',
    author: 'Lori Evert',
    category: 'story',
    cover: '/covers/the-brave-little-puppy.webp?v=5',
    notes: 'A Wish Book • Photographs by Per Breiehagen • From the creators of The Christmas Wish',
    pages: []
  },
  {
    id: 'christmas_in_the_manger',
    title: 'Christmas in the Manger',
    author: 'Nola Buck',
    category: 'story',
    cover: '/covers/christmas-in-the-manger.webp?v=7',
    notes: 'Illustrated by Felicia Bond • Gentle Nativity board book for little hands',
    pages: []
  },
  {
    id: 'can_you_see_what_i_see_christmas',
    title: 'Can You See What I See? Christmas',
    author: 'Walter Wick',
    category: 'story',
    cover: '/covers/can-you-see-what-i-see-christmas.webp?v=5',
    notes: 'Scholastic • Search-and-find holiday photograph puzzles by Walter Wick',
    pages: []
  },
  {
    id: 'very_hungry_caterpillars_snowy_hide_and_seek',
    title: "The Very Hungry Caterpillar's Snowy Hide & Seek",
    author: 'Eric Carle',
    category: 'story',
    cover: '/covers/very-hungry-caterpillars-snowy-hide-and-seek.webp?v=5',
    notes: 'World of Eric Carle • A finger trail lift-the-flap winter book',
    pages: []
  },
  {
    id: 'rudolph_helps_out',
    title: 'Rudolph the Red-Nosed Reindeer: Rudolph Helps Out',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/rudolph-helps-out.webp?v=5',
    notes: 'Classic Rudolph holiday board book adventure',
    pages: []
  },
  {
    id: 'little_blue_trucks_christmas',
    title: "Little Blue Truck's Christmas",
    author: 'Alice Schertle',
    category: 'story',
    cover: '/covers/little-blue-trucks-christmas.webp?v=5',
    notes: 'Illustrated by Jill McElmurry • Delivering Christmas trees with twinkling lights!',
    pages: []
  },
  {
    id: 'touch_and_feel_christmas',
    title: 'Touch and Feel Christmas',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/touch-and-feel-christmas.webp?v=5',
    notes: 'Shoebox Touch and Feel Holiday Board Book',
    pages: []
  },
  {
    id: 'rudolph_wonderful_winter',
    title: 'Rudolph the Red-Nosed Reindeer: Wonderful Winter',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/rudolph-wonderful-winter.webp?v=5',
    notes: 'Classic Rudolph snowy winter board book',
    pages: []
  },
  {
    id: 'marys_baby',
    title: "Mary's Baby",
    author: 'Jane Chapman',
    category: 'story',
    cover: '/covers/marys-baby.webp?v=5',
    notes: 'Scholastic • A tender Nativity story of baby Jesus',
    pages: []
  },
  {
    id: 'berenstain_bears_very_first_christmas',
    title: 'The Berenstain Bears: The Very First Christmas',
    author: 'Jan & Mike Berenstain',
    category: 'story',
    cover: '/covers/berenstain-bears-very-first-christmas.webp?v=5',
    notes: 'Living Lights • A Faith Story celebrating the Christmas Nativity',
    pages: []
  },
  {
    id: 'the_night_before_jesus',
    title: 'The Night Before Jesus',
    author: 'Herbert Brokering',
    category: 'story',
    cover: '/covers/the-night-before-jesus.webp?v=5',
    notes: 'Poetic Christmas reflection by Herbert Brokering',
    pages: []
  },
  {
    id: 'story_orchestra_the_nutcracker',
    title: 'The Story Orchestra: The Nutcracker',
    author: 'Jessica Courtney-Tickle',
    category: 'story',
    cover: '/covers/story-orchestra-the-nutcracker.webp?v=5',
    notes: "Illustrated by Jessica Courtney-Tickle • Musical sound book playing Tchaikovsky's Nutcracker",
    pages: []
  },
  {
    id: 'happy_day_christmas',
    title: 'A Happy Day Book: Christmas',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/happy-day-christmas.webp?v=5',
    notes: "A Happy Day Book • Vintage holiday children's keepsake",
    pages: []
  },
  {
    id: 'a_carol_for_christmas',
    title: 'A Carol for Christmas',
    author: 'Ann Tompert',
    category: 'story',
    cover: '/covers/a-carol-for-christmas.webp?v=5',
    notes: 'Illustrated by Laura Kelly • A heartwarming Christmas story of music and faith',
    pages: []
  },
  {
    id: 'construction_site_on_christmas_night',
    title: 'Construction Site on Christmas Night',
    author: 'Sherri Duskey Rinker',
    category: 'story',
    cover: '/covers/construction-site-on-christmas-night.webp?v=5',
    notes: 'Illustrated by AG Ford • From the author of Goodnight, Goodnight, Construction Site',
    pages: []
  },
  {
    id: 'the_best_christmas_pageant_ever',
    title: 'The Best Christmas Pageant Ever',
    author: 'Barbara Robinson',
    category: 'story',
    cover: '/covers/the-best-christmas-pageant-ever.webp?v=8',
    notes: 'Avon Camelot Vintage Paperback • The hilarious and touching Herdman family Christmas pageant',
    pages: []
  },
  {
    id: 'the_gingerbread_man',
    title: 'The Gingerbread Man',
    author: 'Gail Yerrill',
    category: 'story',
    cover: '/covers/the-gingerbread-man.webp?v=5',
    notes: 'Illustrated by Gail Yerrill • Classic holiday fairy tale',
    pages: []
  },
  {
    id: 'christmas_with_the_mousekins',
    title: 'Christmas with the Mousekins',
    author: 'Maggie Smith',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/christmas-with-the-mousekins.webp?v=5',
    notes: 'A Story with Crafts, Recipes, Poems and More! • Cozy holiday fun with the Mousekin family',
    pages: []
  },
  {
    id: 'corduroys_christmas',
    title: "Corduroy's Christmas",
    author: 'Don Freeman',
    category: 'story',
    cover: '/covers/corduroys-christmas.webp?v=8',
    notes: 'A Lift-the-Flap Book • Pictures by Lisa McCue • Based on the character created by Don Freeman',
    pages: []
  },
  {
    id: 'gingerbread_mouse',
    title: 'Gingerbread Mouse',
    author: 'Katy Bratun',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/gingerbread-mouse.webp?v=5',
    notes: 'Written and illustrated by Katy Bratun • A mouse builds a cozy gingerbread house on Christmas Eve',
    pages: []
  },
  {
    id: 'pick_a_pine_tree',
    title: 'Pick a Pine Tree',
    author: 'Patricia Toht',
    category: 'story',
    cover: '/covers/pick-a-pine-tree.webp?v=5',
    notes: 'Illustrated by Jarvis • Joyful rhyming celebration of decorating the Christmas tree',
    pages: []
  },
  {
    id: 'the_muttcracker',
    title: 'The Muttcracker',
    author: 'Anna Kemp',
    category: 'story',
    cover: '/covers/the-muttcracker.webp?v=5',
    notes: "Illustrated by Sara Ogilvie • From the creators of Dogs Don't Do Ballet",
    pages: []
  },
  {
    id: 'christmas_crafts',
    title: 'Christmas Crafts',
    author: 'Jean Eick',
    category: 'story',
    cover: '/covers/christmas-crafts.webp?v=5',
    notes: 'Festive holiday projects and handmade decorations for children',
    pages: []
  },
  {
    id: 'christmas_in_the_stable',
    title: 'Christmas in the Stable',
    author: 'Astrid Lindgren',
    category: 'story',
    cover: '/covers/christmas-in-the-stable.webp?v=5',
    notes: 'Illustrated by Harald Wiberg • Classic Swedish storytelling of the first Christmas',
    pages: []
  },
  {
    id: 'brave_irene',
    title: 'Brave Irene',
    author: 'William Steig',
    category: 'story',
    cover: '/covers/brave-irene.webp?v=5',
    notes: 'New York Times Best Illustrated Book • A courageous girl braves a fierce winter snowstorm',
    pages: []
  },
  {
    id: 'night_before_christmas_fujikawa',
    title: 'The Night Before Christmas (Gyo Fujikawa)',
    author: 'Clement C. Moore',
    category: 'story',
    cover: '/covers/night-before-christmas-fujikawa.webp?v=5',
    notes: 'Pictures by Gyo Fujikawa • Beloved vintage illustrated edition',
    pages: []
  },
  {
    id: 'santa_mouse',
    title: 'Santa Mouse',
    author: 'Michael Brown',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/santa-mouse.webp?v=7',
    notes: 'We have 2 copies of this book in our holiday collection! • Illustrated by Elfrieda De Witt',
    pages: []
  },
  {
    id: 'santa_mouse_where_are_you',
    title: 'Santa Mouse, Where Are You?',
    author: 'Michael Brown',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/santa-mouse-where-are-you.webp?v=7',
    notes: 'Illustrated by Elfrieda De Witt • Beloved sequel to Santa Mouse',
    pages: []
  },
  {
    id: 'mouse_family_christmas',
    title: 'Mouse Family Christmas',
    author: 'Deborah Underwood',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/mouse-family-christmas.webp?v=5',
    notes: 'Illustrated by Leah Hong • Sweet holiday preparations with the Mouse family',
    pages: []
  },
  {
    id: 'the_mice_before_christmas',
    title: 'The Mice Before Christmas',
    author: 'Anne L. Watson',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/the-mice-before-christmas.webp?v=5',
    notes: 'Illustrated by Wendy Edelson • Miniature woodland mice prepare for St. Nicholas',
    pages: []
  },
  {
    id: 'the_little_christmas_elf',
    title: 'The Little Christmas Elf',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/the-little-christmas-elf.webp?v=5',
    notes: 'A Little Golden Book • Classic holiday elf tale',
    pages: []
  },
  {
    id: 'hilary_knights_twelve_days_of_christmas',
    title: "Hilary Knight's The Twelve Days of Christmas",
    author: 'Hilary Knight',
    category: 'story',
    cover: '/covers/hilary-knights-twelve-days-of-christmas.webp?v=5',
    notes: 'Whimsical classic illustrations by the artist of Eloise',
    pages: []
  },
  {
    id: 'santa_is_coming_to_indianapolis',
    title: 'Santa is Coming to Indianapolis',
    author: 'Steve Smallman',
    category: 'story',
    cover: '/covers/santa-is-coming-to-indianapolis.webp?v=5',
    notes: 'Illustrated by Robert Dunn and Katherine Kirkland • Featuring the Indianapolis Motor Speedway',
    pages: []
  },
  {
    id: 'the_animals_christmas_eve',
    title: "The Animals' Christmas Eve",
    author: 'Unknown',
    category: 'story',
    cover: '/covers/the-animals-christmas-eve.webp?v=5',
    notes: 'A Little Golden Book Classic • Woodland and barnyard animals celebrate Christmas Eve',
    pages: []
  },
  {
    id: 'the_biggest_snowman_ever',
    title: 'The Biggest Snowman Ever',
    author: 'Steven Kroll',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/the-biggest-snowman-ever.webp?v=5',
    notes: 'Illustrated by Jeni Bassett • Two little mice team up to build the biggest snowman in Mouseville!',
    pages: []
  },
  {
    id: 'the_first_christmas_popup',
    title: 'The First Christmas: A Christmas Pop-up',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/the-first-christmas-popup.webp?v=5',
    notes: 'Three-dimensional pop-up Nativity keepsake book',
    pages: []
  },
  {
    id: 'night_before_christmas_santore',
    title: 'The Night Before Christmas (Classic Edition)',
    author: 'Clement C. Moore',
    category: 'story',
    cover: '/covers/night-before-christmas-santore.webp?v=5',
    notes: 'Illustrated by Charles Santore • #1 New York Times Bestselling Edition',
    pages: []
  },
  {
    id: 'merry_christmas_mouse',
    title: 'Merry Christmas, Mouse!',
    author: 'Laura Numeroff',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/merry-christmas-mouse.webp?v=5',
    notes: 'Illustrated by Felicia Bond • From the creators of If You Give a Mouse a Cookie',
    pages: []
  },
  {
    id: 'christmas_from_heaven',
    title: 'Christmas from Heaven',
    author: 'Tom Brokaw',
    category: 'story',
    cover: '/covers/christmas-from-heaven.webp?v=5',
    notes: 'Illustrated by Robert T. Barrett • Mormon Tabernacle Choir • The True Story of the Berlin Candy Bomber',
    pages: []
  },
  {
    id: 'the_polar_express',
    title: 'The Polar Express',
    author: 'Chris Van Allsburg',
    category: 'story',
    cover: '/covers/the-polar-express.webp?v=5',
    notes: 'Caldecott Medal Winner • Houghton Mifflin Company • All aboard the magical Christmas Eve train to the North Pole',
    pages: [
      { id: 'polar_express_title', pageNumber: 1, image: '/covers/the-polar-express-title.webp?v=5' }
    ]
  },
  {
    id: 'why_christmas_trees_arent_perfect',
    title: "Why Christmas Trees Aren't Perfect",
    author: 'Richard H. Schneider',
    category: 'story',
    cover: '/covers/why-christmas-trees-arent-perfect.webp?v=5',
    notes: "Illustrated by Elizabeth J. Miles • A tale of Little Pine's selfless kindness in the royal forest",
    pages: []
  },
  {
    id: 'how_the_grinch_stole_christmas',
    title: 'How the Grinch Stole Christmas!',
    author: 'Dr. Seuss',
    category: 'story',
    cover: '/covers/how-the-grinch-stole-christmas.webp?v=5',
    notes: 'Classic holiday favorite from Whoville by Dr. Seuss',
    pages: []
  },
  {
    id: 'merry_christmas_curious_george',
    title: 'Merry Christmas, Curious George',
    author: 'Margret and H.A. Rey',
    category: 'story',
    cover: '/covers/merry-christmas-curious-george.webp?v=5',
    notes: "Curious George celebrates Christmas at the children's hospital",
    pages: []
  },
  {
    id: 'christmas_in_the_country',
    title: 'Christmas in the Country',
    author: 'Cynthia Rylant & Diane Goode',
    category: 'story',
    cover: '/covers/christmas-in-the-country.webp?v=5',
    notes: 'Nostalgic memories of a cozy country Christmas with grandparents',
    pages: []
  },
  {
    id: 'rudolph_1939_facsimile',
    title: 'Rudolph the Red-Nosed Reindeer (1939 Facsimile)',
    author: 'Robert L. May',
    category: 'story',
    cover: '/covers/rudolph-1939-facsimile.webp?v=5',
    notes: 'Illustrated by Denver Gillen • Original 1939 Montgomery Ward Edition Facsimile (Applewood Books)',
    pages: [
      { id: 'rudolph_1939_title', pageNumber: 1, image: '/covers/rudolph-1939-title.webp?v=5' }
    ]
  },
  {
    id: 'the_bear_who_slept_through_christmas',
    title: 'The Bear Who Slept Through Christmas',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/the-bear-who-slept-through-christmas.webp?v=5',
    notes: "Ideals Publishing • Featuring Ted E. Bear's search for the true meaning of Christmas",
    pages: []
  },
  {
    id: 'the_berenstain_bears_christmas_tree',
    title: "The Berenstain Bears' Christmas Tree",
    author: 'Stan and Jan Berenstain',
    category: 'story',
    cover: '/covers/the-berenstain-bears-christmas-tree.webp?v=5',
    notes: "Papa Bear searches the forest for the Grizzly family's Christmas tree",
    pages: []
  },
  {
    id: 'a_christmas_carol_popup',
    title: 'A Christmas Carol: A Christmas Pop-up',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/a-christmas-carol-popup.webp?v=5',
    notes: "Three-dimensional holiday pop-up adaptation of Charles Dickens' classic",
    pages: []
  },
  {
    id: 'the_berenstain_bears_joy_of_giving',
    title: 'The Berenstain Bears and the Joy of Giving',
    author: 'Jan & Mike Berenstain',
    category: 'story',
    cover: '/covers/the-berenstain-bears-joy-of-giving.webp?v=5',
    notes: 'Living Lights • A Faith Story • Brother and Sister Bear discover the joy of giving',
    pages: []
  },
  {
    id: 'christmas_comes_to_monster_mountain',
    title: 'Christmas Comes to Monster Mountain',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/christmas-comes-to-monster-mountain.webp?v=5',
    notes: 'Ideals Publishing • Featuring Ted E. Bear in a snowy mountain adventure',
    pages: []
  },
  {
    id: 'the_baby_jesus',
    title: 'The Baby Jesus',
    author: 'Dr. Mary Alice Jones',
    category: 'story',
    cover: '/covers/the-baby-jesus.webp?v=5',
    notes: 'Checkerboard Press (#086) • A First Religious Book • Vintage Nativity keepsake',
    pages: []
  },
  {
    id: 'christmas_joys',
    title: 'Christmas Joys',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/christmas-joys.webp?v=8',
    notes: 'A Rand McNally Junior Elf Book (#8206 • 49¢) • Vintage holiday storybook',
    pages: []
  },
  {
    id: 'night_before_christmas_golden',
    title: 'The Night Before Christmas (Little Golden Book)',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/night-before-christmas-golden.webp?v=5',
    notes: 'A Little Golden Book Vintage Edition',
    pages: []
  },
  {
    id: 'jingle_bells_golden',
    title: 'Jingle Bells',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/jingle-bells-golden.webp?v=5',
    notes: 'A Little Golden Book Vintage Edition (#58-31) • Festive sleigh ride adventure',
    pages: []
  },
  {
    id: 'rudolph_little_golden_book',
    title: 'Rudolph the Red-Nosed Reindeer (Little Golden Book)',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/rudolph-little-golden-book.webp?v=5',
    notes: 'A Little Golden Book Vintage Edition (#331 • 29¢)',
    pages: []
  },
  {
    id: 'the_snowman_golden',
    title: 'The Snowman',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/the-snowman-golden.webp?v=5',
    notes: 'A Little Golden Book (#00451) • Magical winter snowman story',
    pages: []
  },
  {
    id: 'christmas_miracle_of_jonathan_toomey',
    title: 'The Christmas Miracle of Jonathan Toomey',
    author: 'Susan Wojciechowski',
    category: 'story',
    cover: '/covers/christmas-miracle-of-jonathan-toomey.webp?v=5',
    notes: 'Illustrated by P.J. Lynch • A master woodcarver carves a Nativity set that heals his heart',
    pages: []
  },
  {
    id: 'twas_the_night_before_christmas_1937',
    title: "'Twas the Night Before Christmas (1937 Vintage)",
    author: 'Clement Clarke Moore',
    category: 'story',
    cover: '/covers/twas-the-night-before-christmas-1937.webp?v=5',
    notes: 'Illustrated by Thelma Gooch • 1937 Grosset & Dunlap Heirloom Edition',
    pages: [
      { id: 'twas_1937_title', pageNumber: 1, image: '/covers/twas-the-night-before-christmas-1937-title.webp?v=5' }
    ]
  },
  {
    id: 'the_small_one',
    title: 'The Small One',
    author: 'Charles Tazewell',
    category: 'story',
    cover: '/covers/the-small-one.webp?v=5',
    notes: 'A Story for Those Who Like Christmas and Small Donkeys • The gentle donkey who carried Mary to Bethlehem',
    pages: []
  },
  {
    id: 'christmas_customs_and_traditions',
    title: 'Christmas Customs and Traditions: Their History and Significance',
    author: 'Clement A. Miles',
    category: 'story',
    cover: '/covers/christmas-customs-and-traditions.webp?v=5',
    notes: 'With 21 Illustrations • Classic historical treasury of Christmas folklore and traditions',
    pages: []
  },
  {
    id: 'twelve_days_of_christmas_golden',
    title: 'The Twelve Days of Christmas: A Christmas Carol',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/twelve-days-of-christmas-golden.webp?v=5',
    notes: 'A Little Golden Book (#454-09) • Classic illustrated carol',
    pages: []
  },
  {
    id: 'jolly_old_santa_claus_ideals',
    title: 'Jolly Old Santa Claus (Ideals)',
    author: 'Unknown',
    category: 'story',
    isMagazine: true,
    badge: 'Vintage Holiday Magazine',
    cover: '/covers/jolly-old-santa-claus-ideals.webp?v=7',
    notes: 'Vintage Holiday Magazine • Ideals Publishing ($2.50 Issue) • Illustrated holiday poetry, stories, and nostalgia',
    pages: []
  },
  {
    id: 'the_jolly_christmas_postman',
    title: 'The Jolly Christmas Postman',
    author: 'Janet & Allan Ahlberg',
    category: 'story',
    cover: '/covers/the-jolly-christmas-postman.webp?v=5',
    notes: 'Interactive storybook with real holiday letters and cards for fairy-tale characters',
    pages: []
  },
  {
    id: 'arthurs_christmas',
    title: "Arthur's Christmas",
    author: 'Marc Brown',
    category: 'story',
    cover: '/covers/arthurs-christmas.webp?v=5',
    notes: 'An Arthur Adventure • Arthur tries to find the perfect Christmas gift for Santa',
    pages: []
  },
  {
    id: 'the_christmas_mouse',
    title: 'The Christmas Mouse',
    author: 'Toby Forward & Ruth Brown',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/the-christmas-mouse.webp?v=5',
    notes: 'Written by Toby Forward • Illustrated by Ruth Brown • A lonely mouse finds Christmas warmth',
    pages: []
  },
  {
    id: 'one_christmas_wish',
    title: 'One Christmas Wish',
    author: 'Katherine Rundell',
    category: 'story',
    cover: '/covers/one-christmas-wish.webp?v=5',
    notes: 'Illustrated by Emily Sutton • Bloomsbury • Christmas Eve ornaments come to life',
    pages: []
  },
  {
    id: 'the_santa_claus_book_golden_shape',
    title: 'The Santa Claus Book',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/the-santa-claus-book-golden-shape.webp?v=5',
    notes: 'A Golden Shape Book (#5920) • Vintage die-cut Santa Claus storybook',
    pages: []
  },
  {
    id: 'i_spy_christmas',
    title: 'I Spy Christmas: A Book of Picture Riddles',
    author: 'Jean Marzollo',
    category: 'story',
    cover: '/covers/i-spy-christmas.webp?v=5',
    notes: 'Photographs by Walter Wick • Riddles by Jean Marzollo • Scholastic New Challenges Edition',
    pages: []
  },
  {
    id: 'jingle_the_christmas_clown',
    title: 'Jingle, the Christmas Clown',
    author: 'Tomie dePaola',
    category: 'story',
    cover: '/covers/jingle-the-christmas-clown.webp?v=7',
    notes: 'Written and illustrated by Tomie dePaola • A tiny Italian circus brings joy on Christmas Eve',
    pages: []
  },
  {
    id: 'a_merry_mouse_christmas_abc',
    title: 'A Merry Mouse Christmas ABC',
    author: 'Priscilla Hillman',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/a-merry-mouse-christmas-abc.webp?v=5',
    notes: 'Charming alphabet of Victorian mice celebrating Christmas from A to Z',
    pages: []
  },
  {
    id: 'jan_bretts_christmas_treasury',
    title: "Jan Brett's Christmas Treasury",
    author: 'Jan Brett',
    category: 'story',
    cover: '/covers/jan-bretts-christmas-treasury.webp?v=5',
    notes: 'Seven beloved Jan Brett holiday classics collected in one heirloom volume',
    pages: []
  },
  {
    id: 'santa_claus_and_the_dormouse',
    title: 'Santa Claus and the Dormouse',
    author: 'Eleonore Schmid',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/santa-claus-and-the-dormouse.webp?v=5',
    notes: 'Written and illustrated by Eleonore Schmid • A curious dormouse wakes up to discover Christmas',
    pages: []
  },
  {
    id: 'the_magic_of_christmas',
    title: 'The Magic of Christmas',
    author: 'Claire Freedman',
    category: 'story',
    cover: '/covers/the-magic-of-christmas.webp?v=5',
    notes: 'Illustrated by Gail Yerrill • Woodland friends share the wonder of Christmas Eve',
    pages: []
  },
  {
    id: 'the_christmas_wish',
    title: 'The Christmas Wish',
    author: 'Lori Evert',
    category: 'story',
    cover: '/covers/the-christmas-wish.webp?v=5',
    notes: "Photographs by Per Breiehagen • New York Times Bestseller • Anja's magical Nordic quest to find Santa",
    pages: []
  },
  {
    id: 'mortimers_christmas_manger',
    title: "Mortimer's Christmas Manger",
    author: 'Karma Wilson',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/mortimers-christmas-manger.webp?v=5',
    notes: 'Illustrated by Jane Chapman • A little mouse makes room in the Nativity manger for Baby Jesus',
    pages: []
  },
  {
    id: 'the_witchs_christmas',
    title: "The Witch's Christmas",
    author: 'Norman Bridwell',
    category: 'story',
    cover: '/covers/the-witchs-christmas.webp?v=5',
    notes: 'Vintage Scholastic Paperback (TW 1793 • 50¢) • From the creator of Clifford the Big Red Dog',
    pages: []
  },
  {
    id: 'christmas_comes_to_mrs_mouse',
    title: 'Christmas Comes to Mrs. Mouse',
    author: 'Peggy Burton',
    category: 'story',
    isMouseBook: true,
    cover: '/covers/christmas-comes-to-mrs-mouse.webp?v=8',
    notes: 'A cozy woodland mouse tale of holiday hospitality',
    pages: []
  },
  {
    id: 'indian_christmas',
    title: 'Indian Christmas: Essays, Memories, Hymns',
    author: 'Jerry Pinto and Madhulika Liddle',
    category: 'story',
    cover: '/covers/indian-christmas.webp?v=5',
    notes: 'Edited and with Introductions by Jerry Pinto and Madhulika Liddle • Rich anthology of Christmas traditions across India',
    pages: []
  },
  {
    id: 'treasury_of_christmas_songs_and_carols',
    title: 'A Treasury of Christmas Songs and Carols',
    author: 'Henry W. Simon',
    category: 'story',
    cover: '/covers/treasury-of-christmas-songs-and-carols.webp?v=5',
    notes: "The Easton Press Collector's Edition • Bound in Genuine Leather • Edited and annotated by Henry W. Simon",
    pages: [
      { id: 'treasury_songs_title', pageNumber: 1, image: '/covers/treasury-of-christmas-songs-and-carols-title.webp?v=5' }
    ]
  },
  {
    id: 'christmas_annual_1946',
    title: 'Christmas: An American Annual of Christmas Literature and Art (1946)',
    author: 'Randolph E. Haugan',
    category: 'story',
    isMagazine: true,
    badge: 'Vintage Holiday Magazine',
    cover: '/covers/christmas-annual-vol-16.webp?v=5',
    notes: 'Vintage Holiday Magazine • Augsburg Publishing House • Includes "Winter\'s Approach" watercolor by Garnet Hazard',
    pages: [
      { id: 'annual_16_title', pageNumber: 1, image: '/covers/christmas-annual-vol-16-title.webp?v=5' }
    ]
  },
  {
    id: 'christmas_annual_vol_41',
    title: 'Christmas: An American Annual of Christmas Literature and Art (Vol. 41)',
    author: 'Randolph E. Haugan',
    category: 'story',
    isMagazine: true,
    badge: 'Vintage Holiday Magazine',
    cover: '/covers/christmas-annual-vol-41.webp?v=7',
    notes: 'Vintage Holiday Magazine • Volume Forty-One (1971) • Edited by Randolph E. Haugan • Augsburg Publishing House, Minneapolis',
    pages: [
      { id: 'annual_41_title', pageNumber: 1, image: '/covers/christmas-annual-vol-41-title.webp?v=5' }
    ]
  },
  {
    id: 'christmas_annual_vol_47',
    title: 'Christmas: An American Annual of Christmas Literature and Art (Vol. 47)',
    author: 'Randolph E. Haugan',
    category: 'story',
    isMagazine: true,
    badge: 'Vintage Holiday Magazine',
    cover: '/covers/christmas-annual-vol-47.webp?v=5',
    notes: 'Vintage Holiday Magazine • Volume Forty-Seven (1977) • Edited by Randolph E. Haugan • Augsburg Publishing House, Minneapolis',
    pages: [
      { id: 'annual_47_title', pageNumber: 1, image: '/covers/christmas-annual-vol-47-title.webp?v=5' }
    ]
  },
  {
    id: 'turkey_claus',
    title: 'Turkey Claus',
    author: 'Wendi Silvano',
    category: 'story',
    cover: '/covers/turkey-claus.webp?v=5',
    notes: 'Illustrated by Lee Harper • Turkey disguises himself to visit Santa at the North Pole!',
    pages: []
  },
  {
    id: 'reindeer_of_the_year_sequins',
    title: 'Reindeer of the Year',
    author: 'Unknown',
    category: 'story',
    cover: '/covers/reindeer-of-the-year.webp?v=5',
    notes: 'With two-way reversible sequins! • Interactive holiday board book',
    pages: []
  },
  // Family Photo Albums
  {
    id: 'album_santa',
    title: 'Pictures with Santa',
    author: 'Agan Family Keepsake',
    category: 'album',
    cover: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=80',
    notes: 'Our annual keepsake album of all our pictures with Santa Claus 🎅 (Upload Apple Photos here!)',
    pages: [],
  },
  // Family Cookbooks & Keepsakes
  {
    id: 'cookbook_erin',
    title: "Strom Family Cookbook",
    author: 'Down Home For Dinner • 1999 Reunion',
    category: 'cookbook',
    badge: 'Cookbook',
    cover: '/covers/strom-family-cookbook.webp?v=6',
    pdfUrl: '/strom_family_cookbook_cleaned.pdf',
    notes: 'Treasured family recipes, childhood memories & photos dedicated to Albion Sr. & Laura Strom 🥧 (Contributed by Erin, Sally, Peter, Virginia & family)',
    pages: Array.from({ length: 86 }, (_, i) => ({
      id: `cookbook_page_${i + 1}`,
      pageNumber: i + 1,
      image: `/cookbook/page_${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
  {
    id: 'twelve_days_of_christmas_cookbook',
    title: 'The Twelve Days of Christmas Cookbook',
    author: 'Suzanne Huntley',
    category: 'cookbook',
    badge: 'Cookbook',
    cover: '/covers/twelve-days-of-christmas-cookbook.webp?v=5',
    notes: 'Praised by James Beard: "To a lover of the Christmas traditions, this book is a joy. All the recipes awaken memories of wondrous smells and tastes of the season."',
    pages: [],
  },
];

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [passcodeError, setPasscodeError] = useState('');
  const [googleUser, setGoogleUser] = useState(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  // Listen for Google Auth state & redirect results (strictly restricted to harrisonagan@gmail.com)
  useEffect(() => {
    try {
      sessionStorage.removeItem('erin_library_access_unlocked');
      localStorage.removeItem('erin_library_access_unlocked');
    } catch {}

    checkGoogleRedirectResult()
      .then((u) => {
        if (u && isAuthorizedUser(u)) {
          setGoogleUser(u);
          setIsUnlocked(true);
        }
      })
      .catch((err) => {
        setPasscodeError(err.message || 'Access denied.');
      });

    const unsub = subscribeToAuthChanges((u) => {
      if (u && isAuthorizedUser(u)) {
        setGoogleUser(u);
        setIsUnlocked(true);
      } else {
        setGoogleUser(null);
        setIsUnlocked(false);
      }
      setAuthChecking(false);
    });
    return () => unsub && unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setPasscodeError('');
    setIsSigningInGoogle(true);
    try {
      const res = await signInWithGoogle();
      if (res?.user && isAuthorizedUser(res.user)) {
        setGoogleUser(res.user);
        setIsUnlocked(true);
      }
    } catch (err) {
      console.warn('Google sign-in error:', err);
      if (err?.code === 'auth/unauthorized-email') {
        setPasscodeError(err.message);
      } else {
        setPasscodeError('Google sign-in failed: ' + (err.message || err.code));
      }
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const [isAtBookshelf, setIsAtBookshelf] = useState(false);
  const [viewMode, setViewMode] = useState('spines'); // 'spines' | 'covers' | 'list'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'story' | 'mouse' | 'magazine' | 'album' | 'cookbook'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(isFirebaseConfigured());

  // Inline Book Edit state inside Detail Modal
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState('story');
  const [editIsMouse, setEditIsMouse] = useState(false);
  const [editIsMagazine, setEditIsMagazine] = useState(false);

  const LEGACY_PLACEHOLDERS = new Set(['2','3','4','5','6','7','8','9','10','11','12','13','14','album_2024','album_2023']);

  const upgradeBuiltInBooks = (list) => {
    const initOrderMap = new Map(INITIAL_BOOKS.map((b, idx) => [b.id, idx]));
    const initMap = new Map(INITIAL_BOOKS.map((b) => [b.id, b]));
    const upgraded = list.map((b) => {
      const fresh = initMap.get(b.id);
      if (!fresh) return b;
      const shouldUseFreshCover = !b.cover || b.cover.startsWith('/covers/');
      if (b.userEdited) {
        return {
          ...fresh,
          ...b,
          cover: shouldUseFreshCover ? fresh.cover : b.cover,
          pages: b.pages && b.pages.length > 0 ? b.pages : fresh.pages,
        };
      }
      return {
        ...b,
        ...fresh,
        pages: b.pages && b.pages.length > 0 ? b.pages : fresh.pages,
      };
    });

    // Ensure built-in books follow canonical INITIAL_BOOKS order (e.g. Santa Mouse & sequel together)
    return upgraded.sort((a, b) => {
      const aIdx = initOrderMap.has(a.id) ? initOrderMap.get(a.id) : 9999;
      const bIdx = initOrderMap.has(b.id) ? initOrderMap.get(b.id) : 9999;
      return aIdx - bIdx;
    });
  };

  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('erin_christmas_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = upgradeBuiltInBooks(parsed.filter(b => !LEGACY_PLACEHOLDERS.has(String(b.id))));
        const existingIds = new Set(cleaned.map((b) => b.id));
        const missing = INITIAL_BOOKS.filter((b) => !existingIds.has(b.id));
        const combined = [...cleaned, ...missing];
        const initOrderMap = new Map(INITIAL_BOOKS.map((b, idx) => [b.id, idx]));
        return combined.sort((a, b) => {
          const aIdx = initOrderMap.has(a.id) ? initOrderMap.get(a.id) : 9999;
          const bIdx = initOrderMap.has(b.id) ? initOrderMap.get(b.id) : 9999;
          return aIdx - bIdx;
        });
      }
    } catch (e) {}
    return INITIAL_BOOKS;
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState('story');
  const [isCookbookOpen, setIsCookbookOpen] = useState(false);
  const [cookbookInitialRecipe, setCookbookInitialRecipe] = useState(null);

  // URL Hash Routing for Dedicated Cookbook View (#/cookbook, #/cookbook?recipe=slug)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('cookbook') || search.includes('cookbook=1')) {
        setIsAtBookshelf(true);
        setIsCookbookOpen(true);
        const match = hash.match(/recipe=([^&]+)/);
        if (match && match[1]) {
          setCookbookInitialRecipe(decodeURIComponent(match[1]));
        }
      }
    };
    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  const handleUnlock = (e) => {
    e?.preventDefault();
    if (passcodeInput.trim() === currentSecretPasscode.trim()) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('erin_library_access_unlocked', 'true');
        if (rememberDevice) {
          localStorage.setItem('erin_library_access_unlocked', 'true');
        } else {
          localStorage.removeItem('erin_library_access_unlocked');
        }
      } catch {}
      setPasscodeError('');
      setPasscodeInput('');
    } else {
      setPasscodeError('Incorrect passcode. Please try again.');
    }
  };

  const handleLock = async () => {
    setIsUnlocked(false);
    setGoogleUser(null);
    try {
      sessionStorage.removeItem('erin_library_access_unlocked');
      localStorage.removeItem('erin_library_access_unlocked');
      await signOutGoogle();
    } catch {}
  };

  // 1. Load from IndexedDB on launch (immune to 5MB localStorage limit!)
  useEffect(() => {
    async function loadIndexedDBBooks() {
      try {
        const stored = await getBooksFromIndexedDB();
        if (stored && Array.isArray(stored) && stored.length > 0) {
          const cleaned = upgradeBuiltInBooks(stored.filter(b => !LEGACY_PLACEHOLDERS.has(String(b.id))));
          setBooks((current) => {
            const currentCleaned = upgradeBuiltInBooks(current.filter(b => !LEGACY_PLACEHOLDERS.has(String(b.id))));
            const storedIds = new Set(cleaned.map((b) => b.id));
            const missing = currentCleaned.filter((b) => !storedIds.has(b.id));
            const merged = [...cleaned, ...missing];
            saveBooksToIndexedDB(merged);
            return merged;
          });
        }
      } catch (err) {
        console.warn('Error reading from IndexedDB:', err);
      }
    }
    loadIndexedDBBooks();
  }, []);

  // 2. Real-time Google Firebase sync across all devices
  useEffect(() => {
    if (isFirebaseConfigured()) {
      setIsCloudConnected(true);
      const unsubscribe = subscribeToBooksFromCloud((cloudBooks) => {
        if (cloudBooks && Array.isArray(cloudBooks)) {
          setBooks((current) => {
            const upgradedCloud = upgradeBuiltInBooks(cloudBooks.filter((b) => !LEGACY_PLACEHOLDERS.has(String(b.id))));
            const cloudIds = new Set(upgradedCloud.map((b) => b.id));
            const nonCloud = upgradeBuiltInBooks(
              current.filter((b) => !cloudIds.has(b.id) && !LEGACY_PLACEHOLDERS.has(String(b.id)))
            );
            const merged = [...upgradedCloud, ...nonCloud];
            saveBooksToIndexedDB(merged);
            return merged;
          });
        }
      });
      return () => unsubscribe && unsubscribe();
    } else {
      setIsCloudConnected(false);
    }
  }, [isCloudConnected]);

  // 3. Save to IndexedDB whenever books change
  useEffect(() => {
    saveBooksToIndexedDB(books);
    try {
      localStorage.setItem('erin_christmas_books', JSON.stringify(books));
    } catch (e) {}
  }, [books]);

  const filteredBooks = books.filter((b) =>
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setIsEditingBook(false);
    setEditTitle(book.title || '');
    setEditAuthor(book.author || 'Unknown');
    setEditNotes(book.notes || '');
    setEditCategory(book.category || 'story');
    setEditIsMouse(isMouseBookItem(book));
    setEditIsMagazine(isMagazineItem(book));
  };

  const handleSaveBookEdits = async (e) => {
    e?.preventDefault();
    if (!selectedBook) return;
    const updated = {
      ...selectedBook,
      title: editTitle.trim() || selectedBook.title,
      author: editAuthor.trim() || 'Unknown',
      notes: editNotes.trim(),
      category: editCategory,
      isMouseBook: editIsMouse,
      isMagazine: editIsMagazine,
      badge: editIsMagazine ? 'Vintage Holiday Magazine' : null,
      userEdited: true,
    };
    setSelectedBook(updated);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setIsEditingBook(false);
    if (isFirebaseConfigured()) {
      try {
        await saveBookToCloud(updated);
      } catch (err) {
        console.warn('Cloud update error:', err);
      }
    }
  };

  const handleBookAdded = (newBook) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Remove this book from Erin\'s Christmas shelf?')) return;
    const target = books.find((b) => b.id === bookId);
    if (isFirebaseConfigured()) {
      try {
        await deleteBookFromCloud(bookId, target?.coverStoragePath);
      } catch (e) {
        console.warn('Cloud delete error:', e);
      }
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setSelectedBook(null);
  };

  const handleBooksRestored = (restoredBooks) => {
    setBooks(restoredBooks);
    saveBooksToIndexedDB(restoredBooks);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0d0907] text-amber-50 select-none flex items-center justify-center p-4 relative overflow-hidden font-serif">
        {/* Ambient Candle Glow */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-600/10 blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-w-sm w-full bg-[#18110df6] backdrop-blur-md rounded-3xl border border-amber-900/60 p-7 sm:p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
            <span>🕯️</span>
            <span className="text-[10px] uppercase tracking-widest font-sans font-semibold text-amber-300/80">
              Private Holiday Collection
            </span>
            <span>🕯️</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-amber-100 mb-2">
            Erin's Christmas Library
          </h1>

          <p className="text-stone-300 text-xs font-sans mb-6 leading-relaxed">
            Private access restricted to authorized Google account only.
          </p>

          {/* Primary Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningInGoogle || authChecking}
            className="w-full py-3.5 px-4 bg-white hover:bg-stone-100 text-stone-900 font-sans font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-3 transition active:scale-95 disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>
              {authChecking
                ? 'Checking session...'
                : isSigningInGoogle
                ? 'Signing in with Google...'
                : 'Sign in with Google'}
            </span>
          </button>

          {passcodeError && (
            <p className="text-xs text-rose-400 font-sans mt-4">{passcodeError}</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110c09] text-amber-50 select-none overflow-x-hidden font-serif">
      <AnimatePresence mode="wait">
        {!isAtBookshelf ? (
          /* ========================================================= */
          /* 1. SITTING IN THE COZY CABIN LANDING SCENE                */
          /* ========================================================= */
          <motion.div
            key="cabin-landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.85, ease: 'easeInOut' } }}
            className="w-screen h-screen overflow-hidden"
          >
            <CabinLanding onStepUp={() => setIsAtBookshelf(true)} />
          </motion.div>
        ) : (
          /* ========================================================= */
          /* 2. STANDING AT THE BOOKSHELF & VIEWS                      */
          /* ========================================================= */
          <motion.div
            key="bookshelf-area"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen flex flex-col bg-[#140e0b] relative pb-20"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 0%, #2a160c 0%, #140e0b 70%)',
            }}
          >
            {/* Ambient Warm Candlelight Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-amber-600/10 blur-[130px] pointer-events-none" />

            {/* Responsive Navigation Header */}
            <header className="sticky top-0 z-30 bg-[#1b130f]/95 backdrop-blur-md border-b border-amber-950/70 shadow-lg px-4 sm:px-8 py-3">
              {/* Desktop Header Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAtBookshelf(false)}
                    className="px-3 py-1.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-sans text-amber-200/80 hover:text-amber-100 transition flex items-center gap-1.5"
                    title="Step back to sit by the fire"
                  >
                    <span>←</span> <span>Cabin Hearth</span>
                  </button>
                  <span className="text-stone-700">|</span>
                  <h2 className="text-base font-bold text-amber-100 tracking-wide flex items-center gap-2">
                    <span>🎄</span> <span>Erin's Christmas Library</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search books or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3.5 py-1.5 bg-stone-950/80 border border-stone-800 rounded-lg text-xs text-amber-100 focus:outline-none focus:border-amber-700 w-48 font-sans placeholder:text-stone-500"
                  />

                  <div className="flex bg-stone-950/80 p-0.5 rounded-lg border border-stone-800 font-sans text-xs">
                    <button
                      onClick={() => setViewMode('spines')}
                      className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                        viewMode === 'spines'
                          ? 'bg-amber-800/80 text-amber-100 font-medium shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>🎄</span> <span>Shelf</span>
                    </button>
                    <button
                      onClick={() => setViewMode('covers')}
                      className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                        viewMode === 'covers'
                          ? 'bg-amber-800/80 text-amber-100 font-medium shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>🖼️</span> <span>Covers</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                        viewMode === 'list'
                          ? 'bg-amber-800/80 text-amber-100 font-medium shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>📋</span> <span>List</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsCloudModalOpen(true)}
                    className="px-3 py-1.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-sans text-stone-300 hover:text-amber-200 transition flex items-center gap-1.5"
                    title="Cloud Sync & Backup"
                  >
                    <span>☁️</span>
                    <span className="hidden lg:inline">{isCloudConnected ? 'Cloud Active' : 'Cloud Backup'}</span>
                  </button>

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-white rounded-xl text-xs font-sans font-medium transition shadow flex items-center gap-1.5"
                  >
                    <span>+</span> <span>Add Book</span>
                  </button>

                  {!googleUser ? (
                    <button
                      onClick={handleGoogleSignIn}
                      className="px-3 py-2 bg-white/95 hover:bg-white text-stone-900 rounded-xl text-xs font-sans font-semibold transition shadow flex items-center gap-1.5"
                      title="Sign in with Google for AI & Cloud"
                    >
                      <span>G</span> <span>Sign In</span>
                    </button>
                  ) : (
                    <div
                      className="px-2.5 py-1.5 bg-stone-900/90 border border-stone-800 rounded-xl text-xs font-sans text-amber-200 flex items-center gap-1.5"
                      title={`Signed in as ${googleUser.email || googleUser.displayName}`}
                    >
                      {googleUser.photoURL ? (
                        <img src={googleUser.photoURL} alt="" className="w-4 h-4 rounded-full" />
                      ) : (
                        <span>👤</span>
                      )}
                      <span className="hidden lg:inline max-w-[90px] truncate">
                        {googleUser.displayName?.split(' ')[0] || 'Google'}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleLock}
                    className="px-3 py-2 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-sans text-stone-400 hover:text-amber-200 transition flex items-center gap-1"
                    title="Sign out & lock library"
                  >
                    <span>🔒</span> <span>Lock</span>
                  </button>
                </div>
              </div>

              {/* Mobile Header Layout (2 Rows, Never Cuts Off "+ Add Book") */}
              <div className="flex flex-col gap-2.5 md:hidden">
                {/* Row 1: Back, Title, Add Book */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsAtBookshelf(false)}
                    className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs font-sans text-amber-200/80 flex items-center gap-1"
                  >
                    <span>←</span> <span>Cabin</span>
                  </button>

                  <h2 className="text-sm font-bold text-amber-100 truncate px-2">
                    🎄 Erin's Library
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsCloudModalOpen(true)}
                      className="px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-300 hover:text-amber-200"
                      title="Cloud Sync & Backup"
                    >
                      ☁️
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-lg text-xs font-sans font-semibold shadow flex items-center gap-1 active:scale-95"
                    >
                      <span>+</span> <span>Add</span>
                    </button>
                    <button
                      onClick={handleLock}
                      className="px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-400 hover:text-amber-200"
                      title="Lock library"
                    >
                      🔒
                    </button>
                  </div>
                </div>

                {/* Row 2: Search & View Switcher */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-stone-950/80 border border-stone-800 rounded-lg text-xs text-amber-100 focus:outline-none focus:border-amber-700 font-sans placeholder:text-stone-500"
                  />

                  <div className="flex bg-stone-950/80 p-0.5 rounded-lg border border-stone-800 font-sans text-xs flex-shrink-0">
                    <button
                      onClick={() => setViewMode('spines')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'spines' ? 'bg-amber-800 text-amber-100 font-semibold' : 'text-stone-400'
                      }`}
                      title="Bookshelf View"
                    >
                      🎄
                    </button>
                    <button
                      onClick={() => setViewMode('covers')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'covers' ? 'bg-amber-800 text-amber-100 font-semibold' : 'text-stone-400'
                      }`}
                      title="Cover Gallery"
                    >
                      🖼️
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'list' ? 'bg-amber-800 text-amber-100 font-semibold' : 'text-stone-400'
                      }`}
                      title="List View"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Floating Quick-Add Button on Mobile (Always within thumb reach) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="md:hidden fixed bottom-6 right-6 z-30 px-4 py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.8)] border border-amber-400/40 font-sans text-xs font-semibold flex items-center gap-2 active:scale-95"
            >
              <span>📸</span>
              <span>+ Add Book</span>
            </button>

            {/* Main Stage Content */}
            <main className="flex-1 w-full">
              {viewMode === 'spines' && (
                <SpineBookshelf
                  books={filteredBooks}
                  externalFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onSelectBook={handleSelectBook}
                  onAddBook={(cat) => {
                    setAddModalCategory(cat || 'story');
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {viewMode === 'covers' && (
                <CoverGalleryView
                  books={filteredBooks}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onSelectBook={handleSelectBook}
                  onAddBook={() => {
                    setAddModalCategory('story');
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {viewMode === 'list' && (
                <ListView
                  books={filteredBooks}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onSelectBook={handleSelectBook}
                  onDeleteBook={handleDeleteBook}
                />
              )}
            </main>

            {/* Book Detail Inspector Showcase Modal */}
            {selectedBook && (
              <div 
                className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setSelectedBook(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#1c1511f8] border border-amber-900/60 rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.95)] relative font-sans text-amber-50 max-h-[92vh] overflow-y-auto my-auto"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 transition text-lg z-20"
                    title="Close"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Large, Beautiful 3D Book Cover (Hugs the book's natural proportions) */}
                    <div className="relative flex-shrink-0 group flex items-center justify-center">
                      <div className="relative inline-flex items-center justify-center rounded-r-xl rounded-l-sm shadow-[0_22px_45px_rgba(0,0,0,0.9),-8px_0_20px_rgba(0,0,0,0.6)] overflow-hidden border border-amber-950/60 bg-[#140c08]">
                        {/* Realistic 3D Hardcover Spine Highlight */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/60 via-white/15 to-transparent z-10 pointer-events-none" />

                        <img
                          src={getBookCoverUrl(selectedBook) || selectedBook.cover}
                          alt={selectedBook.title}
                          className="max-h-[330px] sm:max-h-[410px] md:max-h-[450px] max-w-[240px] sm:max-w-[290px] md:max-w-[330px] w-auto h-auto object-contain select-none block"
                        />
                      </div>
                    </div>

                    {/* Book Details & Reading Actions */}
                    <div className="flex-1 text-center md:text-left flex flex-col justify-between self-stretch w-full">
                      {!isEditingBook ? (
                        <div>
                          <div className="flex items-center justify-center md:justify-start flex-wrap gap-2 mb-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-900/50 rounded-full text-[11px] font-mono text-amber-300/90">
                              <span>🎄</span>
                              <span>Erin's Holiday Collection</span>
                            </div>

                            {(selectedBook.category === 'cookbook' || selectedBook.id === 'cookbook_erin' || selectedBook.id === 'twelve_days_of_christmas_cookbook') && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/80 border border-amber-400/60 rounded-full text-[11px] font-sans font-semibold text-amber-100 shadow">
                                <span>🥧</span>
                                <span>Cookbook</span>
                              </div>
                            )}

                            {isMagazineItem(selectedBook) && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/70 border border-amber-400/50 rounded-full text-[11px] font-sans font-semibold text-amber-100 shadow">
                                <span>📜</span>
                                <span>Vintage Holiday Magazine</span>
                              </div>
                            )}

                            {isMouseBookItem(selectedBook) && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900/90 border border-amber-600/50 rounded-full text-[11px] font-sans font-semibold text-amber-200 shadow">
                                <span>🐭</span>
                                <span>Mouse Book</span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-100 tracking-wide leading-tight mb-2">
                            {selectedBook.title}
                          </h3>

                          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4">
                            <p className="text-stone-300 text-sm sm:text-base font-sans font-medium">
                              By <span className="text-amber-200">{selectedBook.author || 'Unknown'}</span>
                            </p>
                            <button
                              onClick={() => setIsEditingBook(true)}
                              className="px-2.5 py-0.5 rounded-lg bg-stone-900 hover:bg-amber-950 border border-stone-700 hover:border-amber-700 text-[11px] text-amber-300/90 transition"
                              title="Edit title, author, notes, or tags"
                            >
                              ✏️ Edit Details
                            </button>
                          </div>

                          {selectedBook.notes && (
                            <div className="text-amber-200/90 text-sm sm:text-base italic bg-amber-950/30 border border-amber-900/40 p-4 rounded-2xl mb-6 font-serif leading-relaxed text-left">
                              <span className="text-amber-400 font-serif text-lg mr-1">“</span>
                              {selectedBook.notes}
                              <span className="text-amber-400 font-serif text-lg ml-1">”</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Inline Book Metadata Editor */
                        <form onSubmit={handleSaveBookEdits} className="space-y-3 text-left bg-stone-950/70 p-4 rounded-2xl border border-amber-900/50 mb-4">
                          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Edit Book Details</span>
                            <button
                              type="button"
                              onClick={() => setIsEditingBook(false)}
                              className="text-xs text-stone-400 hover:text-stone-200"
                            >
                              Cancel
                            </button>
                          </div>

                          <div>
                            <label className="block text-[11px] text-stone-400 mb-1">Book Title</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-stone-400 mb-1">Author (use "Unknown" if unlisted)</label>
                            <input
                              type="text"
                              value={editAuthor}
                              onChange={(e) => setEditAuthor(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-stone-400 mb-1">Notes / Edition Details</label>
                            <textarea
                              rows={2}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            <label className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editIsMouse}
                                onChange={(e) => setEditIsMouse(e.target.checked)}
                                className="rounded bg-stone-900 border-stone-700 text-amber-600"
                              />
                              <span>🐭 Mouse Book</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editIsMagazine}
                                onChange={(e) => setEditIsMagazine(e.target.checked)}
                                className="rounded bg-stone-900 border-stone-700 text-amber-600"
                              />
                              <span>📜 Vintage Holiday Magazine</span>
                            </label>
                          </div>

                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow transition"
                            >
                              Save Changes ✓
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 flex flex-col gap-3">
                        {selectedBook.id === 'cookbook_erin' ? (
                          <div className="w-full flex flex-col gap-2.5">
                            <button
                              onClick={() => {
                                setIsCookbookOpen(true);
                                setSelectedBook(null);
                                window.location.hash = '#/cookbook';
                              }}
                              className="w-full py-4 px-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-50 rounded-2xl text-sm font-semibold shadow-[0_10px_25px_rgba(180,83,9,0.5)] border border-amber-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                            >
                              <span className="text-xl">🥧</span>
                              <span className="font-bold">Open Interactive Cookbook & Recipes</span>
                            </button>
                            <div className="flex items-center justify-center gap-4 text-xs font-sans text-stone-400 pt-1">
                              <button
                                onClick={() => setIsReaderOpen(true)}
                                className="hover:text-amber-200 underline"
                              >
                                View Classic Page Flip Scan
                              </button>
                              <span>•</span>
                              <a
                                href={selectedBook.pdfUrl || '/strom_family_cookbook_cleaned.pdf'}
                                download="strom_family_cookbook_cleaned.pdf"
                                className="hover:text-amber-200 underline"
                              >
                                Download Full PDF
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col sm:flex-row gap-3 items-center">
                            <button
                              onClick={() => setIsReaderOpen(true)}
                              className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-50 rounded-2xl text-sm font-semibold shadow-[0_8px_20px_rgba(180,83,9,0.4)] border border-amber-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                            >
                              <span className="text-lg">📖</span>
                              <span>
                                {selectedBook.pages && selectedBook.pages.length > 0
                                  ? `Open & View Inside Page (${selectedBook.pages.length})`
                                  : 'Open Storybook & Read'}
                              </span>
                            </button>

                            <button
                              onClick={() => handleDeleteBook(selectedBook.id)}
                              className="w-full sm:w-auto px-4 py-3.5 bg-stone-900/60 hover:bg-red-950/50 text-stone-400 hover:text-red-300 border border-stone-800 hover:border-red-900/60 rounded-2xl text-xs font-medium transition"
                              title="Remove from shelf"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable Page Reader Modal */}
      <AnimatePresence>
        {isReaderOpen && selectedBook && (
          <ReaderModal
            book={selectedBook}
            onClose={() => setIsReaderOpen(false)}
            onUpdateBook={(updated) => {
              setSelectedBook(updated);
              setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Book with Camera & AI Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        initialCategory={addModalCategory}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

      {/* Cloud Backup & Firebase Settings Modal */}
      <CloudBackupModal
        isOpen={isCloudModalOpen}
        onClose={() => {
          setIsCloudModalOpen(false);
          setIsCloudConnected(isFirebaseConfigured());
        }}
        books={books}
        onBooksRestored={handleBooksRestored}
      />

      {/* Dedicated Interactive Kitchen Cookbook View (#/cookbook) */}
      <AnimatePresence>
        {isCookbookOpen && (
          <CookbookView
            initialRecipeId={cookbookInitialRecipe}
            onClose={() => {
              setIsCookbookOpen(false);
              setCookbookInitialRecipe(null);
              if (window.location.hash.includes('cookbook')) {
                window.history.pushState(null, '', window.location.pathname + window.location.search);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
