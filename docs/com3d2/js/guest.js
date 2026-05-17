(function ($) {
	"use strict";

	$(function () {
		initGallery();
	});

	async function initGallery() {

		const data = await fetchCharacters();

		renderCards(data);
		updateGallery();


	}

	/**
	 * JSONデータを取得する
	 * @returns 
	 */
	async function fetchCharacters() {

		const response = await fetch(
			"https://img.maisonmaid.com/com3d/json/official_presets.json"
		);

		return await response.json();
	}

	/**
	 * ソートの値で順番を並び替える
	 * @param {*} data 
	 */
	function renderCards(data) {

		const gallery = document.getElementById("gallery");

		const shuffled = [...data].sort(
			() => Math.random() - 0.5
		);

		shuffled.forEach(character => {
			const card = createCard(character);
			gallery.appendChild(card);
		});
	}

	/**
	 * カードを生成する
	 * @param {*} character キャラクターデータ
	 * @returns 
	 */
	function createCard(character) {

		const card = document.createElement("div");

		card.className =
			"card wow fadeInUp col-4 col-md-3 col-lg-2 col-xl-2";

		card.dataset.id = character.id;
		card.title = character.name;
		card._character = character;

		card.innerHTML = `
		<a href="${character.url}"
		   class="card-body" rel="noopener noreferrer"
		   data-bs-toggle="modal"
		   data-bs-target="#exampleModal">
			<div class="card-image">
				<img class="card-image-image" src="${character.image}">
			</div>
			<h3 class="card-name">${character.name}</h3>
		</a>`;

		return card;
	}

	const modal = document.getElementById('exampleModal')

	modal.addEventListener('show.bs.modal', event => {

		const card = event.relatedTarget.parentElement._character;

		modal.querySelector('.modal-title').textContent = card.name;

		modal.querySelector('.modal-image').innerHTML = `
			<img src="${card.image}" class="img-fluid">
		`

		modal.querySelector('.modal-detail').innerHTML = `
			<dl class="modal-list">
			  <dt>カテゴリ</dt>
			  <dd>${card.category}</dd>
			  <dt>MOD</dt>
			  <dd>${card.mod.join(",")}</dd>
			  <dt>拡張</dt>
			  <dd>${card.append.join(",")}</dd>
			  <dt>META</dt>
			  <dd>${card.meta}</dd>
			</dl>
		`
		modal.querySelector('.btn-primary').href = card.url;
	})

	function updateGallery() {

		const cards = [
			...document.querySelectorAll(".card")
		];

		sortCards(cards);

	}

	function sortCards(cards) {

		const gallery =
			document.getElementById("gallery");

		cards
			.sort((a, b) =>
				b.dataset.score - a.dataset.score
			)
			.forEach(card => {
				gallery.appendChild(card);
			});

	}

	// ------------------------
	// utility
	// ------------------------

	function matchLevel(value, level) {

		if (level === "high") {
			return value >= 70;
		}

		if (level === "mid") {
			return value >= 40 && value < 70;
		}

		if (level === "low") {
			return value < 40;
		}

		return true;

	}
})(jQuery);