import { App, Modal, ItemView, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, TFile, ToggleComponent, TextComponent, DropdownComponent, ButtonComponent } from 'obsidian';
import { start } from 'repl';
import { createDailyNote } from 'obsidian-daily-notes-interface';
import * as moment from 'moment';

export default class MyVantagePlugin extends Plugin {
	onload() {
		console.log('Loading the Vantage plugin.');

		let naturalLanguageDates = app.plugins.getPlugin('nldates-obsidian');
		if (!naturalLanguageDates) {
			new Notice("The Natural Language Dates plugin was not found. The Review plugin requires the Natural Language Dates plugin. Please install it first and make sure it is updated and enabled before using Vantage.");
		}

		this.addCommand({
			id: 'build-search',
			name: "Build a new search",
			
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new VantageModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		// this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading the Vantage plugin');
	}

	// getBacklinks(someFile: TFile) { // No longer used
	// 	let obsidianApp = this.app;
	// 	let allNotes = this.app.vault.getMarkdownFiles();
	// 	let currentBacklinks: Object[] = [];

	// 	allNotes.forEach((markdownFile: TFile) => {
	// 		this.app.metadataCache.getFileCache(markdownFile);
	// 		let thisMetadataCache = obsidianApp.metadataCache.getFileCache(markdownFile);
	// 		if (thisMetadataCache.links) {
	// 			for (let eachLink of thisMetadataCache.links) {
	// 				if (eachLink.link === currentFileName) {
	// 					currentBacklinks.push({noteName: markdownFile.basename, startPosition: eachLink.position.start, endPosition: eachLink.position.end});
	// 				}
	// 			}
	// 		}
	// 		if (thisMetadataCache.embeds) {
	// 			for (let eachEmbed of thisMetadataCache.embeds) {
	// 				if (eachEmbed.link.contains(currentFileName)) {
	// 					currentBacklinks.push({noteName: markdownFile.basename, startPosition: eachEmbed.position.start, endPosition: eachEmbed.position.end});
	// 				}
	// 			}
	// 		}
	// 	});

	// 	return currentBacklinks;
	// }

	delay(waittimeInMilliseconds: number) { // hat-tip to Rohith K P for this handy asynchronous delay function (https://stackoverflow.com/questions/17883692/how-to-set-time-delay-in-javascript/49813472#49813472)
		return new Promise(resolve => {
		  setTimeout(() => {
			resolve(2);
		  }, waittimeInMilliseconds);
		});
	  }

	async getSearch(someSearchQuery: string) {
		this.app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch(someSearchQuery);
		await this.delay(5000);
		let searchResults = this.app.workspace.getLeavesOfType('search')[0].view.dom.resultDoms;//hat-tip to MrJackPhil for figuring out how to play with Search
		console.log(searchResults);
		if (searchResults.length != 0) {
			searchResults.forEach(eachFile => console.log(eachFile.file.basename));	
		}
	}

	openAnchorPane(someLeaf: WorkspaceLeaf) {
		let obsidianApp = this.app;
		let currentLeaf = someLeaf;
		let editor = obsidianApp.workspace.activeLeaf.view.sourceMode.cmEditor;
		let currentFile = currentLeaf.view.file;
		let currentFileName = currentFile.basename;
		let doc = editor.getDoc();
		let cursor = editor.getCursor();

		console.log(obsidianApp.metadataCache.getFileCache(currentFile));

		let theBacklinks = this.getBacklinks(currentFile);

		//This successfully generates a list of links to the current note, including the start and end position of those links. 
		console.log(theBacklinks);

		// ☐ How do I get the plugin to notice when a new backlink has been added, and refresh the list?
		// ☐ How do I display this list in a pane that can be customized/moved around?
		// ☐ How do I make sure the items in this list are links to their source?
		// ☑︎ How do I do the above with tags? Answer: use search, riffing off of MrJackPhil's expand embeds workflow. See getSearch above

	}


}

class VantageModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		let vantagePlugin = this.app.plugins.getPlugin("vantage-obsidian");
		let naturalLanguageDates = this.app.plugins.getPlugin('nldates-obsidian'); // Get the Natural Language Dates plugin.
		this.titleEl.setText("Vantage - Advanced Search");
		let vantageSettingsDiv = contentEl.createEl("div");

		let vantageSettingsDescriptionDiv = contentEl.createEl("div");
		vantageSettingsDescriptionDiv.addClass("setting-item");
		let vantageSettingsDescriptionSubdiv = contentEl.createEl("div");
		vantageSettingsDescriptionSubdiv.addClass("setting-item-info");
		let vantageSettingsDescription = contentEl.createEl("div", { "text": "Vantage helps create complex search queries. See Obsidian's search documentation for more."});
		vantageSettingsDescription.addClass("setting-item-description");
		let vantageSettingsDescriptionLink = contentEl.createEl("a", {"text": "https://publish.obsidian.md/help/Plugins/Search"});
		let vantageSettingsLinebreakDiv = contentEl.createEl("div");
		let vantageSettingsLinebreak = contentEl.createEl("br");
		vantageSettingsLinebreakDiv.append(vantageSettingsLinebreak);
		vantageSettingsLinebreakDiv.addClass("setting-item-description");
		vantageSettingsDescriptionLink.addClass("setting-item-description");
		vantageSettingsDescriptionLink.setAttr("href", "https://publish.obsidian.md/help/Plugins/Search");
		let vantageSettingsRegexDescription = contentEl.createEl("div", {"text": "Many complex searches use Regular Expressions. These help us search for patterns in our text. Visit RegExr to learn more and to practice with regular expressions."});
		vantageSettingsRegexDescription.addClass("setting-item-description");
		let vantageSettingsRegexLink = contentEl.createEl("a", {"text": "https://regexr.com/"});
		vantageSettingsRegexLink.setAttr("href", "https://regexr.com/");
		vantageSettingsRegexLink.addClass("setting-item-description");
		vantageSettingsDescriptionSubdiv.append(vantageSettingsDescription);
		vantageSettingsDescriptionSubdiv.append(vantageSettingsDescriptionLink);
		vantageSettingsDescriptionSubdiv.append(vantageSettingsLinebreakDiv);
		vantageSettingsDescriptionSubdiv.append(vantageSettingsRegexDescription);
		vantageSettingsDescriptionSubdiv.append(vantageSettingsRegexLink);
		vantageSettingsDescriptionDiv.append(vantageSettingsDescriptionSubdiv);
		vantageSettingsDiv.append(vantageSettingsDescriptionDiv);

		// Note attributes
		let noteAttributesHeadingDiv = contentEl.createEl("h2", { "text": "Search note attributes"});
		noteAttributesHeadingDiv.addClass("setting-item");
		noteAttributesHeadingDiv.addClass("setting-item-heading");
		vantageSettingsDiv.append(noteAttributesHeadingDiv);

		// Note Titles
		let noteTitleContainsDiv = contentEl.createEl("div");
		noteTitleContainsDiv.addClass("setting-item");
		let noteTitleInfoDiv = contentEl.createEl("div");
		noteTitleInfoDiv.addClass("setting-item-info");
		let noteTitleControlDiv = contentEl.createEl("div");
		noteTitleControlDiv.addClass("setting-item-control");
		let noteTitleContainsText = contentEl.createEl("span", { "text": "Note title contains: " });
		noteTitleContainsText.addClass("setting-item-name");
		let noteTitleContainsInput = contentEl.createEl("input", {"type": "text"});
		//noteTitleContainsInput.setAttr("style", "float: right; width: 50%");
		noteTitleInfoDiv.append(noteTitleContainsText);
		noteTitleControlDiv.append(noteTitleContainsInput);
		noteTitleContainsDiv.append(noteTitleInfoDiv);
		noteTitleContainsDiv.append(noteTitleControlDiv);
		vantageSettingsDiv.append(noteTitleContainsDiv);

		// Date range:
		let dateRangeDiv = contentEl.createEl("div");
		dateRangeDiv.addClass("setting-item")
		let dateRangeHeaderDiv = contentEl.createEl("div");
		dateRangeHeaderDiv.addClass("setting-item-info");
		let dateRangeHeader = contentEl.createEl("div", { "text": "Date range: " });
		dateRangeHeader.addClass("setting-item-name");
		let dateRangeSubtitle = contentEl.createEl("span", { "text": "(Entering data here will make the search include only daily notes (and may conflict with the above). Use natural language.)"});
		dateRangeSubtitle.setAttr("class", "setting-item-description");
		dateRangeHeaderDiv.append(dateRangeHeader);
		dateRangeHeaderDiv.append(dateRangeSubtitle);

		let startDateDiv = contentEl.createEl("div");
		let startDateInfoDiv = contentEl.createEl("div");
		startDateInfoDiv.addClass("setting-item-info");
		let startDateText = contentEl.createEl("div", {"text": "Start date: "});
		startDateText.addClass("setting-item-name");
		startDateInfoDiv.append(startDateText);
		let startDateControlDiv = contentEl.createEl("div");
		startDateControlDiv.addClass("setting-item-control");
		let startDateInput = contentEl.createEl("input", {"type": "text"});
		startDateControlDiv.append(startDateInput);
		startDateDiv.append(startDateInfoDiv);
		startDateDiv.append(startDateControlDiv);

		let endDateDiv = contentEl.createEl("div");
		let endDateInfoDiv = contentEl.createEl("div");
		endDateInfoDiv.addClass("setting-item-info");
		let endDateText = contentEl.createEl("div", {"text": "End date: "});
		endDateText.addClass("setting-item-name");
		endDateInfoDiv.append(endDateText);
		let endDateControlDiv = contentEl.createEl("div");
		endDateControlDiv.addClass("setting-item-control");
		let endDateInput = contentEl.createEl("input", {"type": "text"});
		endDateControlDiv.append(endDateInput);
		endDateDiv.append(endDateInfoDiv);
		endDateDiv.append(endDateControlDiv);

		dateRangeDiv.append(dateRangeHeaderDiv);
		dateRangeDiv.append(startDateDiv);
		dateRangeDiv.append(endDateDiv);
		vantageSettingsDiv.append(dateRangeDiv);
		
		// Tagged with
		let tagDiv = contentEl.createEl("div");
		tagDiv.addClass("setting-item");
		let tagInfoDiv = contentEl.createEl("div");
		let tagControlDiv = contentEl.createEl("div");
		tagInfoDiv.addClass("setting-item-info");
		tagControlDiv.addClass("setting-item-control");
		let noteTagText = contentEl.createEl("div", { "text": "Tagged with: " });
		noteTagText.addClass("setting-item-name");
		tagInfoDiv.append(noteTagText);
		let tagInput = contentEl.createEl("input", {"type": "text"});
		tagControlDiv.append(tagInput);
		// tagInput.setAttr("style", "float: right; width: 50%");
		tagDiv.append(tagInfoDiv);
		tagDiv.append(tagControlDiv);
		vantageSettingsDiv.append(tagDiv);


		// Notes with Path
		let notesPathDiv = contentEl.createEl("div");
		notesPathDiv.addClass("setting-item");
		let notesPathInfoDiv = contentEl.createEl("div");
		let notesPathControlDiv = contentEl.createEl("div");
		notesPathInfoDiv.addClass("setting-item-info");
		notesPathControlDiv.addClass("setting-item-control");
		let notesPathText = contentEl.createEl("div", { "text": "Notes in folder or path: " });
		notesPathText.addClass("setting-item-name");
		let notePathDescription = contentEl.createEl("span", { "text": "For example, include the folder to your Daily Notes to search all daily notes."});
		notePathDescription.setAttr("class", "setting-item-description");
		notesPathInfoDiv.append(notesPathText);
		notesPathInfoDiv.append(notePathDescription);
		let notesPathInput = contentEl.createEl("input", {"type": "text"});
		notesPathControlDiv.append(notesPathInput);
		// notesPathInput.setAttr("style", "float: right; width: 50%");
		notesPathDiv.append(notesPathInfoDiv);
		notesPathDiv.append(notesPathControlDiv);
		vantageSettingsDiv.append(notesPathDiv);

		// Note contents
		let noteContentsHeadingDiv = contentEl.createEl("h2", { "text": "Search note contents"});
		noteContentsHeadingDiv.addClass("setting-item");
		noteContentsHeadingDiv.addClass("setting-item-heading");
		vantageSettingsDiv.append(noteContentsHeadingDiv);


		contentEl.append(vantageSettingsDiv);

		function processDateRange(startDate: string, endDate: string) { 
			console.log("Start date:");
			let parsedStartDate = naturalLanguageDates.parseDate(startDate);

			console.log("End date:");
			let parsedEndDate = naturalLanguageDates.parseDate(endDate);

			let currentDate = naturalLanguageDates.getFormattedDate(parsedStartDate.moment);
			let dateDirection = "forward";
			let allDates = naturalLanguageDates.getFormattedDate(parsedStartDate.moment);

			if (parsedEndDate.moment.isAfter(parsedStartDate.moment)) {
				console.log("Dates go forward in time.");
				dateDirection = "forward";
			} else {
				dateDirection = "backward";
				console.log("Dates go backwards in time.");
			}

			while (!(currentDate === naturalLanguageDates.getFormattedDate(parsedEndDate.moment))) {
				let currentDateMoment = parsedStartDate.moment;
				if (dateDirection === "forward") {
					currentDateMoment = currentDateMoment.add(1, "days");
				} else {
					currentDateMoment = currentDateMoment.subtract(1, "days");
				}
				let nextDate = naturalLanguageDates.getFormattedDate(currentDateMoment);
				allDates = allDates + " OR " + nextDate;
				currentDate = nextDate;
			}

			return allDates;
		}

		function processTags(inputTags: string) {
			//split by spaces, then return each with tag: appended
			//if no #, add the # too
			let allTags = inputTags.split(" ");
			let processedTags = ""
			for (var eachTag of allTags) {
				if (eachTag.includes("#")) {
					processedTags = processedTags + "tag:" + eachTag + " ";
				} else {
					processedTags = processedTags + "tag:#" + eachTag + " ";
				}
			}
			processedTags = processedTags.trim();
			return processedTags;
		}

		function setSearchQuery() {
			let searchQuery = "";
			if (noteTitleContainsInput.value != "") {
				if ((startDateInput.value != "") && (endDateInput.value != "")) {
					searchQuery = searchQuery + "file:(" + noteTitleContainsInput.value + processDateRange(startDateInput.value, endDateInput.value) + ") ";
				} else {
					searchQuery = searchQuery + "file:(" + noteTitleContainsInput.value + ") ";
				}
			} else if ((startDateInput.value != "") && (endDateInput.value != "")) {
				searchQuery = searchQuery + "file:(" + processDateRange(startDateInput.value, endDateInput.value) + ") ";
			}
			if (tagInput.value != "") {
				searchQuery = searchQuery + "(" + processTags(tagInput.value) + ") ";
			}
			if (notesPathInput.value != "") {
				searchQuery = searchQuery + "path:(" + notesPathInput.value + ") ";
			}

			let newQueries = contentEl.querySelectorAll("div");
			newQueries.forEach((div) => {
				if ((div.id.contains("AND")) || (div.id.contains("OR"))) {
					let contentQuery = div.querySelectorAll("input");
					let subquery = contentQuery.item(0).value;
					let selectBoxes = div.querySelectorAll("select");
					selectBoxes.forEach((select) => {
						if (select.id.contains("Subtype")) {
							if (select.value == "") {
								// do nothing
							}
							if (select.value.contains("link")) {
								subquery = "\\[\\[.*" + subquery + ".*\\]\\]";
							}
							if (select.value.contains("email")) {
								subquery = "([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\.([a-zA-Z]{2,5})";
							}
							if (select.value.contains("phone")) {
								subquery = "[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*";
							}
						}
					});
					selectBoxes.forEach((select) => {
						if (select.id.contains("List")) {
							if (select.value == "") {
								if ((subquery.contains("[a-zA-Z0-9_")) || subquery.contains("}[0-9]")) {
									subquery = "(/" + subquery + "/)";
								}
							}
							if (select.value.contains("list item")) {
								subquery = "(/- [^\[.\]].*" + subquery + ".*/)";
							}
							if (select.value.contains("incomplete")) {
								subquery = "(/- \\[ \\].*" + subquery + ".*/)";
							}
							if (select.value.contains("completed")) {
								subquery = "(/- \\[x\\].*" + subquery + ".*/)";
							}
							if (select.value.contains("all")) {
								subquery = "(/- \\[.\\].*" + subquery + ".*/)";
							}
						}
					});
					selectBoxes.forEach((select) => {
						if (select.id.contains("Type")) {
							if (select.value == "") {
								// do nothing
							}
							if (select.value.contains("section")) {
								subquery = "section:" + subquery;
							}
							if (select.value.contains("block")) {
								subquery = "block:" + subquery;
							}
							if (select.value.contains("line")) {
								subquery = "line:" + subquery;
							}
						}
					});
					if (div.id.contains("AND")) {
						console.log("This is an AND query");
						searchQuery = searchQuery + " " + subquery;
					} else if (div.id.contains("OR")) {
						console.log("This is an OR query");
						searchQuery = searchQuery + " OR " + subquery;
					}
				}
			});
			return searchQuery;
		}

		let vantageButtonsDiv = contentEl.createEl("div");
		vantageButtonsDiv.addClass("setting-item");
		let vantageButtonsControlDiv = contentEl.createEl("div")
		vantageButtonsControlDiv.addClass("setting-item-control");
		let vantageAddedQueriesDiv = contentEl.createEl("div");
		vantageSettingsDiv.append(vantageAddedQueriesDiv);

		var queryCount = 1;

		let addNewAndFieldButton = new ButtonComponent(vantageSettingsDiv)
			.setButtonText("Add an AND search token")
			.setClass("mod-cta")
			.onClick(() => {
				let newQueryDiv = contentEl.createEl("div");
				newQueryDiv.addClass("setting-item");
				newQueryDiv.setAttr("id", "AND query" + queryCount);
				let newQueryInfoDiv = contentEl.createEl("div");
				newQueryInfoDiv.addClass("setting-item-info");
				
				let newQueryControlDiv = contentEl.createEl("div");
				newQueryControlDiv.addClass("setting-item-control")
				let newQuerySentenceStart = contentEl.createEl("div", {"text": "AND search⠀"})
				newQueryControlDiv.append(newQuerySentenceStart);

				// choose query type
				let queryType = contentEl.createEl("select");
				queryType.setAttr("class", "dropdown");
				queryType.multiple;
				//queryType.setAttr("style", "float: right;");
				queryType.setAttr("id", "Additional Query Type " + queryCount);
				let defaultTypeOption = contentEl.createEl("option", { "value": "", "text": "notes"});
				defaultTypeOption.selected;
				queryType.append(defaultTypeOption);
				queryType.append(contentEl.createEl("option", { "value": "section", "text": "sections"}));
				queryType.append(contentEl.createEl("option", { "value": "block", "text": "blocks"}));
				queryType.append(contentEl.createEl("option", { "value": "line", "text": "lines"}));
				newQueryControlDiv.append(queryType);


				let newQueryForText = contentEl.createEl("div", {"text": "⠀for⠀"});
				newQueryControlDiv.append(newQueryForText);

				// choose list type
				let listType = contentEl.createEl("select");
				listType.setAttr("class", "dropdown");
				listType.multiple;
				//listType.setAttr("style", "float: right;");
				listType.setAttr("id", "Additional Query List Type " + queryCount);
				let defaultListTypeOption = contentEl.createEl("option", { "value": "", "text": "any line type"});
				defaultListTypeOption.selected;
				listType.append(defaultListTypeOption);
				listType.append(contentEl.createEl("option", { "value": "list item", "text": "list items"}));
				listType.append(contentEl.createEl("option", { "value": "incomplete tasks", "text": "incomplete tasks"}));
				listType.append(contentEl.createEl("option", { "value": "completed tasks", "text": "completed tasks"}));
				listType.append(contentEl.createEl("option", { "value": "all tasks", "text": "all tasks"}));
				newQueryControlDiv.append(listType);

				// choose query subtype
				let querySubtype = contentEl.createEl("select");
				querySubtype.setAttr("class", "dropdown");
				querySubtype.multiple;
				querySubtype.setAttr("id", "Additional Query Subtype " + queryCount);
				// querySubtype.setAttr("style", "float: right;");
				let defaultSubtypeOption = contentEl.createEl("option", { "value": "", "text": "with text containing"});
				defaultSubtypeOption.selected;
				querySubtype.append(defaultSubtypeOption);
				querySubtype.append(contentEl.createEl("option", { "value": "with a link to notes with names containing", "text": "with links to notes with names containing"}));
				querySubtype.append(contentEl.createEl("option", { "value": "with an email address", "text": "with email addresses (ignores the following search field)"}));
				querySubtype.append(contentEl.createEl("option", { "value": "with a phone number", "text": "with phone numbers (ignores the following search field)"}));
				newQueryControlDiv.append(querySubtype);

				let newQuery = contentEl.createEl("input", {"type": "text"});
				newQuery.setAttr("id", "AND query " + queryCount);
				queryCount = queryCount + 1;
				newQueryControlDiv.append(newQuery);
				newQueryDiv.append(newQueryInfoDiv);
				newQueryDiv.append(newQueryControlDiv);
				vantageAddedQueriesDiv.append(newQueryDiv);
			});

		let addNewOrFieldButton = new ButtonComponent(vantageSettingsDiv)
			.setButtonText("Add an OR search token")
			.setClass("mod-cta")
			.onClick(() => {
				let newQueryDiv = contentEl.createEl("div");
				newQueryDiv.addClass("setting-item");
				newQueryDiv.setAttr("id", "OR query" + queryCount);
				let newQueryInfoDiv = contentEl.createEl("div");
				newQueryInfoDiv.addClass("setting-item-info");
				// let newQueryTextLabel = contentEl.createEl("div", {"text":"OR search ..."});
				// newQueryInfoDiv.append(newQueryTextLabel);
				let newQueryControlDiv = contentEl.createEl("div");
				newQueryControlDiv.addClass("setting-item-control")
				let newQuerySentenceStart = contentEl.createEl("div", {"text": "OR search⠀"})
				newQueryControlDiv.append(newQuerySentenceStart);

				// choose query type
				let queryType = contentEl.createEl("select");
				queryType.setAttr("class", "dropdown");
				queryType.multiple;
				//queryType.setAttr("style", "float: right;");
				queryType.setAttr("id", "Additional Query Type " + queryCount);
				let defaultTypeOption = contentEl.createEl("option", { "value": "", "text": "notes"});
				defaultTypeOption.selected;
				queryType.append(defaultTypeOption);
				queryType.append(contentEl.createEl("option", { "value": "section", "text": "sections"}));
				queryType.append(contentEl.createEl("option", { "value": "block", "text": "blocks"}));
				queryType.append(contentEl.createEl("option", { "value": "line", "text": "lines"}));
				newQueryControlDiv.append(queryType);


				let newQueryForText = contentEl.createEl("div", {"text": "⠀for⠀"});
				newQueryControlDiv.append(newQueryForText);

				// choose list type
				let listType = contentEl.createEl("select");
				listType.setAttr("class", "dropdown");
				listType.multiple;
				//listType.setAttr("style", "float: right;");
				listType.setAttr("id", "Additional Query List Type " + queryCount);
				let defaultListTypeOption = contentEl.createEl("option", { "value": "", "text": "any line type"});
				defaultListTypeOption.selected;
				listType.append(defaultListTypeOption);
				listType.append(contentEl.createEl("option", { "value": "list item", "text": "list items"}));
				listType.append(contentEl.createEl("option", { "value": "incomplete tasks", "text": "incomplete tasks"}));
				listType.append(contentEl.createEl("option", { "value": "completed tasks", "text": "completed tasks"}));
				listType.append(contentEl.createEl("option", { "value": "all tasks", "text": "all tasks"}));
				newQueryControlDiv.append(listType);

				// choose query subtype
				let querySubtype = contentEl.createEl("select");
				querySubtype.setAttr("class", "dropdown");
				querySubtype.multiple;
				querySubtype.setAttr("id", "Additional Query Subtype " + queryCount);
				// querySubtype.setAttr("style", "float: right;");
				let defaultSubtypeOption = contentEl.createEl("option", { "value": "", "text": "with text containing"});
				defaultSubtypeOption.selected;
				querySubtype.append(defaultSubtypeOption);
				querySubtype.append(contentEl.createEl("option", { "value": "with a link to notes with names containing", "text": "with links to notes with names containing"}));
				querySubtype.append(contentEl.createEl("option", { "value": "with an email address", "text": "with email addresses (ignores the following search field)"}));
				querySubtype.append(contentEl.createEl("option", { "value": "with a phone number", "text": "with phone numbers (ignores the following search field)"}));
				newQueryControlDiv.append(querySubtype);

				let newQuery = contentEl.createEl("input", {"type": "text"});
				newQuery.setAttr("id", "OR query " + queryCount);
				queryCount = queryCount + 1;
				newQueryControlDiv.append(newQuery);
				newQueryDiv.append(newQueryInfoDiv);
				newQueryDiv.append(newQueryControlDiv);
				vantageAddedQueriesDiv.append(newQueryDiv);
			});

		let embeddedSearchButton = new ButtonComponent(vantageButtonsControlDiv)
			.setButtonText("Create embedded search")
			.setClass("mod-cta")
			.onClick(() => {
				let embeddedSearchQueryHeader = "```query\n";
				let embeddedSearchQueryFooter = "\n```";
				let embeddedSearchQuery: string;
				startDateInput.removeAttribute("style");
				endDateInput.removeAttribute("style");
				if ((startDateInput.value != "") && (endDateInput.value != "")) { // If both date fields have values, the user is trying to search daily notes
					let parsedStartDate = naturalLanguageDates.parseDate(startDateInput.value);
					let parsedEndDate = naturalLanguageDates.parseDate(endDateInput.value);
					if (naturalLanguageDates.getFormattedDate(parsedStartDate.moment).contains("Invalid")) { // if the start date cannot be processed, let the user know
						console.log("Start date could not be processed.");
						new Notice("Sorry, something seems to be wrong with that start date.");
						startDateInput.setAttr("style", "border-color: var(--background-modifier-error); border-width: .1em;");
					}
					if (naturalLanguageDates.getFormattedDate(parsedEndDate.moment).contains("Invalid")) { // if the end date cannot be processed, let the user know
						console.log("End date could not be processed.");
						new Notice("Sorry, something seems to be wrong with that end date.");
						endDateInput.setAttr("style", "border-color: var(--background-modifier-error); border-width: .1em;");
					} 
					if (!(naturalLanguageDates.getFormattedDate(parsedStartDate.moment).contains("Invalid")) && !(naturalLanguageDates.getFormattedDate(parsedEndDate.moment).contains("Invalid"))) { // otherwise go ahead with the search
						embeddedSearchQuery = embeddedSearchQueryHeader + setSearchQuery() + embeddedSearchQueryFooter;
						let doc = this.app.workspace.activeLeaf.view.sourceMode.cmEditor.getDoc();
						let cursor = doc.getCursor();
						doc.replaceRange(embeddedSearchQuery, cursor);
						this.close();
					}
				} else { // no dates have been entered, so the search can continue
					embeddedSearchQuery = embeddedSearchQueryHeader + setSearchQuery() + embeddedSearchQueryFooter;
					let doc = this.app.workspace.activeLeaf.view.sourceMode.cmEditor.getDoc();
					let cursor = doc.getCursor();
					doc.replaceRange(embeddedSearchQuery, cursor);
					this.close();
				}
				
			});

		let initiateSearchButton = new ButtonComponent(vantageButtonsControlDiv)
			.setButtonText("New search")
			.setClass("mod-cta")
			.onClick(() => {
					let searchQuery = setSearchQuery();
					vantagePlugin.getSearch(searchQuery);
					this.close();
			});

		vantageButtonsDiv.append(vantageButtonsControlDiv);
		vantageSettingsDiv.append(vantageButtonsDiv);
	}
	

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

// class SampleSettingTab extends PluginSettingTab {
// 	display(): void {
// 		let {containerEl} = this;

// 		containerEl.empty();

// 		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text.setPlaceholder('Enter your secret')
// 				.setValue('')
// 				.onChange((value) => {
// 					console.log('Secret: ' + value);
// 				}));

// 	}
// }
