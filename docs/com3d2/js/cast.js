(function ($) {
	"use strict";

	$(function () {
		initGallery();
	});

	async function initGallery() {

		const data = await fetchCharacters();

		renderCards(data);
		applyFormFromURL();
		updateGallery();

		document
			.getElementById("castSearch")
			.addEventListener("submit", onSearch);

	}

	/**
	 * JSONデータを取得する
	 * @returns 
	 */
	async function fetchCharacters() {

		const response = await fetch(
			"https://img.maisonmaid.com/com3d/json/official2.json"
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
			"card wow fadeInUp col-6 col-md-6 col-lg-4 col-xl-3";

		card.dataset.id = character.id;
		card.title = character.meta.name;

		card.dataset.stats = JSON.stringify(
			character.voice
		);

		card.dataset.tags =
			character.meta.tags.join(",");

		card._character = character;

		card.innerHTML = `
		<a href="${character.meta.url}" target="_blank" rel="noopener noreferrer">
			<div class="card-image">
				<img src="${character.meta.img}">
			</div>

			<div class="card-body">
				<h3>${character.meta.name}</h3>
			</div>
		</a>`;

		return card;
	}

	/**
	 * 検索値をフォームに反映させる
	 */
	function applyFormFromURL() {
		const params = new URLSearchParams(
			window.location.search
		);
		setValue("distance", params.get("distance"));
		setValue("comfort", params.get("comfort"));
		setValue("fatigue", params.get("fatigue"));

		// tag複数対応
		const tags = params.getAll("tag");
		const select = document.getElementById("tag");

		[...select.options].forEach(option => {
			option.selected =
				tags.includes(option.value);
		});
	}

	function setValue(id, value) {
		document.getElementById(id).value =
			value || "";
	}

	function getFilters() {

		const select = document.getElementById("tag");

		return {
			distance:
				document.getElementById("distance").value,

			comfort:
				document.getElementById("comfort").value,

			fatigue:
				document.getElementById("fatigue").value,

			tags: [...select.selectedOptions]
				.map(option => option.value)
				.filter(Boolean)
		};

	}

	/**
	 * 検索ボタンを押下したとき、URLを更新する（更新するだけ）
	 * @param {*} filters 
	 */
	function updateURL(filters) {

		const params = new URLSearchParams();
		//console.info(params);

		if (filters.distance) {
			params.set("distance", filters.distance);
		}

		if (filters.comfort) {
			params.set("comfort", filters.comfort);
		}

		if (filters.fatigue) {
			params.set("fatigue", filters.fatigue);
		}

		filters.tags.forEach(tag => {
			params.append("tag", tag);
		});

		history.replaceState(
			null,
			"",
			"?" + params.toString()
		);

	}

	// ------------------------
	// 検索処理
	// ------------------------

	function onSearch(e) {
		e.preventDefault();
		updateGallery();
	}

	function updateGallery() {

		const filters = getFilters();

		updateURL(filters);

		const cards = [
			...document.querySelectorAll(".card")
		];

		cards.forEach(card => {

			const stats = card._character.voice;

			const tags =
				card.dataset.tags.split(",");

			const score =
				calculateScore(
					stats,
					tags,
					filters
				);

			const visible =
				isVisible(
					stats,
					tags,
					filters
				);

			card.dataset.score = score;

			card.classList.toggle(
				"unmatched",
				!visible
			);

		});

		sortCards(cards);

	}

	// ------------------------
	// 判定
	// ------------------------

	function isVisible(stats, tags, filters) {

		if (
			filters.distance &&
			!matchLevel(
				stats.distance,
				filters.distance
			)
		) {
			return false;
		}

		if (
			filters.comfort &&
			!matchLevel(
				stats.comfort,
				filters.comfort
			)
		) {
			return false;
		}

		if (
			filters.fatigue &&
			!matchLevel(
				stats.fatigue,
				filters.fatigue
			)
		) {
			return false;
		}

		if (filters.tags.length > 0) {

			const matched =
				filters.tags.some(tag =>
					tags.includes(tag)
				);

			if (!matched) {
				return false;
			}

		}

		return true;

	}

	function calculateScore(
		stats,
		tags,
		filters
	) {

		let score = 0;

		if (
			filters.distance &&
			matchLevel(
				stats.distance,
				filters.distance
			)
		) {
			score += 30;
		}

		if (
			filters.comfort &&
			matchLevel(
				stats.comfort,
				filters.comfort
			)
		) {
			score += 30;
		}

		if (
			filters.fatigue &&
			matchLevel(
				stats.fatigue,
				filters.fatigue
			)
		) {
			score += 20;
		}

		filters.tags.forEach(tag => {

			if (tags.includes(tag)) {
				score += 10;
			}

		});

		return score;

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