const fetch = require('node-fetch');
const cheerio = require('cheerio');
const tress = require('tress');
const fs = require('fs');
const mongoose = require('mongoose');

const Offer = require('../../models/offer.js');

function scrapeHabr() {
  const habrUrl = 'https://freelance.habr.com/tasks?_=1596613017168&categories=development_all_inclusive%2Cdevelopment_backend%2Cdevelopment_frontend%2Cdevelopment_prototyping%2Cdevelopment_ios%2Cdevelopment_android%2Cdevelopment_desktop%2Cdevelopment_bots%2Cdevelopment_games%2Cdevelopment_1c_dev%2Cdevelopment_scripts%2Cdevelopment_voice_interfaces%2Cdevelopment_other';
  const results = [];

  const queue = tress((url, callback) => {
    fetch(url)
      .then((data) => data.text())
      .then((html) => {
        console.log(`PARSING: ${url}`);

        const $ = cheerio.load(html);

        $('.content-list__item').each((i, el) => {
          const $element = $(el);

          const relPath = $element.find('article div header div.task__title a').attr('href');
          const linkToOffer = `https://freelance.habr.com${relPath}`;

          queue.push(linkToOffer);
        });

        const title = $('body > div.layout > main > section > div > div > div > div.task.task_detail > h2').text();
        const description = $('body > div.layout > main > section > div > div > div > div.task.task_detail > div.task__description').text();
        const budget = $('body > div.layout > main > section > div > div > div > div.task.task_detail > div.task__finance > span').text();
        const publishedAt = $('body > div.layout > main > section > div > div > div > div.task.task_detail > div.task__meta').text();

        const tags = [];
        $('body > div.layout > main > section > div > div > div > div.task.task_detail > div.task__tags > ul li.tags__item').each((i, el) => {
          const $element = $(el);

          const tag = $element.find('a').text();

          tags.push(tag);
        });

        const offer = {
          title: title.replace(/(\r|\n)/gm, ''),
          description: description.replace(/(\r|\n)/gm, ''),
          budget: budget.replace(/(\r|\n)/gm, ''),
          publishedAt: publishedAt.replace(/(\r|\n)/gm, ''),
          url,
        };

        results.push(offer);

        const nextPagePath = $('#pagination > div > a.next_page').attr('href');

        if (nextPagePath) {
          const nextPageUrl = `https://freelance.habr.com${nextPagePath}`;

          if (nextPageUrl === 'https://freelance.habr.com/tasks?_=1596719064746&categories=development_all_inclusive%2Cdevelopment_backend%2Cdevelopment_frontend%2Cdevelopment_prototyping%2Cdevelopment_ios%2Cdevelopment_android%2Cdevelopment_desktop%2Cdevelopment_bots%2Cdevelopment_games%2Cdevelopment_1c_dev%2Cdevelopment_scripts%2Cdevelopment_voice_interfaces%2Cdevelopment_other&page=15') {
            console.log('15 page!');
          } else {
            queue.push(nextPageUrl);
          }
        }

        callback();
      })
      .catch((err) => console.log('Error!', err));
  }, 10);

  // эта функция выполнится, когда в очереди закончатся ссылки
  queue.drain = () => {
    console.log(results);
    results.forEach((el) => {
      const newOffer = new Offer({
        title: el.title,
        description: el.description,
        budget: el.budget,
        publishedAt: el.publishedAt,
        url: el.url,
      });

      try {
        newOffer.save();
        console.log(`${el.title} Saved!`);
      } catch (err) {
        console.log('Save Error!', err);
      }
    });
  };

  // добавляем в очередь ссылку на первую страницу списка
  queue.push(habrUrl);
}

module.exports = scrapeHabr;