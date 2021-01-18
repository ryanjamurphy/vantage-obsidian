import { App, Modal, ItemView, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, TFile, ToggleComponent, TextComponent, DropdownComponent, ButtonComponent } from 'obsidian';
import { start } from 'repl';

export default class MyVantagePlugin extends Plugin {
	onload() {
		console.log('Loading the Vantage plugin.');

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

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading the Vantage plugin');
	}

	getBacklinks(someFile: TFile) {
		let obsidianApp = this.app;
		let allNotes = this.app.vault.getMarkdownFiles();
		let currentBacklinks: Object[] = [];

		allNotes.forEach((markdownFile: TFile) => {
			this.app.metadataCache.getFileCache(markdownFile);
			let thisMetadataCache = obsidianApp.metadataCache.getFileCache(markdownFile);
			if (thisMetadataCache.links) {
				for (let eachLink of thisMetadataCache.links) {
					if (eachLink.link === currentFileName) {
						currentBacklinks.push({noteName: markdownFile.basename, startPosition: eachLink.position.start, endPosition: eachLink.position.end});
					}
				}
			}
			if (thisMetadataCache.embeds) {
				for (let eachEmbed of thisMetadataCache.embeds) {
					if (eachEmbed.link.contains(currentFileName)) {
						currentBacklinks.push({noteName: markdownFile.basename, startPosition: eachEmbed.position.start, endPosition: eachEmbed.position.end});
					}
				}
			}
		});

		return currentBacklinks;
	}

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
		//let modalHeader = this.contentEl.createEl("h1", {text: "Create a new Vantage"});
		this.titleEl.setText("Vantage - Advanced Search");
		let vantageSettingsDiv = contentEl.createEl("div");
		//vantageSettingsDiv.setAttr("style", "display: inline-grid; width: 100%"); // custom styling
		// vantageSettingsDiv.addClass("vertical-tab-content", "is-active");

		let vantageSettingsDescriptionDiv = contentEl.createEl("div");
		vantageSettingsDescriptionDiv.addClass("setting-item");
		let vantageSettingsDescriptionSubdiv = contentEl.createEl("div");
		vantageSettingsDescriptionSubdiv.addClass("setting-item-info");
		let vantageSettingsDescription = contentEl.createEl("div", { "text": "Vantage helps create complex search queries. See Obsidian's search documentation for more."});
		let vantageSettingsDescriptionLink = contentEl.createEl("a", {"text": "https://publish.obsidian.md/help/Plugins/Search"});
		vantageSettingsDescriptionLink.setAttr("href", "https://publish.obsidian.md/help/Plugins/Search");
		vantageSettingsDescription.addClass("setting-item-description");
		vantageSettingsDescriptionLink.addClass("setting-item-description");
		vantageSettingsDescriptionSubdiv.append(vantageSettingsDescription);
		vantageSettingsDescriptionSubdiv.append(vantageSettingsDescriptionLink);
		vantageSettingsDescriptionDiv.append(vantageSettingsDescriptionSubdiv);
		vantageSettingsDiv.append(vantageSettingsDescriptionDiv);

		let vantageSearchScopeNameDiv = contentEl.createEl("div");
		vantageSearchScopeNameDiv.addClass("setting-item-heading");
		let vantageSearchScopeName = contentEl.createEl("div", { "text": "Search parameters" });
		vantageSearchScopeName.addClass("setting-item-name");
		vantageSearchScopeNameDiv.append(vantageSearchScopeName);
		vantageSettingsDiv.append(vantageSearchScopeNameDiv);

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
		let dateRangeHeaderDiv = contentEl.createEl("div");
		dateRangeHeaderDiv.addClass("setting-item-info");
		let dateRangeHeader = contentEl.createEl("div", { "text": "Date range: " });
		dateRangeHeader.addClass("setting-item-name");
		let dateRangeSubtitle = contentEl.createEl("span", { "text": "(Entering data here will make the search include only daily notes. Use natural language.)"});
		dateRangeSubtitle.setAttr("class", "setting-item-description");
		dateRangeHeaderDiv.append(dateRangeHeader);
		dateRangeHeaderDiv.append(dateRangeSubtitle);

		let startDateDiv = contentEl.createEl("div");
		let startDateInfoDiv = contentEl.createEl("div");
		startDateInfoDiv.addClass("setting-item-info");
		let startDateText = contentEl.createEl("div", {"text": "Start date: "});
		startDateText.addClass("setting-item-description");
		startDateInfoDiv.append(startDateText);
		let startDateControlDiv = contentEl.createEl("div");
		startDateControlDiv.addClass("setting-item-control");
		let startDateInput = contentEl.createEl("input", {"type": "text"});
		startDateControlDiv.append(startDateInput);
		startDateDiv.append(startDateInfoDiv);
		startDateDiv.append(startDateControlDiv);

		// let endDateDiv = contentEl.createEl("div");
		// let endDateText = contentEl.createEl("div", {"text": "End date: "});
		// endDateText.addClass("setting-item-description");
		// let endDateInput = contentEl.createEl("input", {"type": "text"});
		// endDateInput.addClass("setting-item-control");
		// endDateDiv.append(endDateText);
		// endDateDiv.append(endDateInput);

		dateRangeDiv.append(dateRangeHeaderDiv);
		dateRangeDiv.append(startDateDiv);
		// dateRangeDiv.append(endDateDiv);
		vantageSettingsDiv.append(dateRangeDiv);
		// noteTitleContainsDiv.setAttr("style", "padding-bottom: 2em;")
		
		// Tagged with
		let tagDiv = contentEl.createEl("div");
		tagDiv.addClass("settings-item");
		let tagInfoDiv = contentEl.createEl("div");
		let tagControlDiv = contentEl.createEl("div");
		tagInfoDiv.addClass("setting-item-info");
		tagControlDiv.addClass("setting-item-control");
		let noteTagText = contentEl.createEl("span", { "text": "Tagged with: " });
		tagInfoDiv.append(noteTagText);
		let tagInput = contentEl.createEl("input", {"type": "text"});
		tagControlDiv.append(tagInput);
		// tagInput.setAttr("style", "float: right; width: 50%");
		tagDiv.append(tagInfoDiv);
		tagDiv.append(tagControlDiv);
		vantageSettingsDiv.append(tagDiv);


		// Notes with Path
		let notesPathDiv = contentEl.createEl("div");
		let notesPathText = contentEl.createEl("span", {"text": "Notes in folder or path: "});
		let notePathInput = contentEl.createEl("input", {"type": "text"});
		// notePathInput.setAttr("style", "float: right; width: 50%");
		notesPathDiv.append(notesPathText);
		notesPathDiv.append(notePathInput);
		vantageSettingsDiv.append(notesPathDiv);

		// Notes containing
		let notesContainingDiv = contentEl.createEl("div");
		let notesContainingText = contentEl.createEl("span", {"text": "Notes containing: "});
		let noteContainingInput = contentEl.createEl("input", {"type": "text"});
		// noteContainingInput.setAttr("style", "float: right; width: 50%");
		notesContainingDiv.append(notesContainingText);
		notesContainingDiv.append(noteContainingInput);
		vantageSettingsDiv.append(notesContainingDiv);

		// Sections containing
		let notesSectionDiv = contentEl.createEl("div");
		let notesSectionText = contentEl.createEl("span", {"text": "Sections containing: "});
		let noteSectionInput = contentEl.createEl("input", {"type": "text"});
		// noteSectionInput.setAttr("style", "float: right; width: 50%");
		notesSectionDiv.append(notesSectionText);
		notesSectionDiv.append(noteSectionInput);
		vantageSettingsDiv.append(notesSectionDiv);
		
		// Blocks containing
		let notesBlockDiv = contentEl.createEl("div");
		let notesBlockText = contentEl.createEl("span", {"text": "Blocks containing: "});
		let noteBlockInput = contentEl.createEl("input", {"type": "text"});
		// noteBlockInput.setAttr("style", "float: right; width: 50%");
		notesBlockDiv.append(notesBlockText);
		notesBlockDiv.append(noteBlockInput);
		vantageSettingsDiv.append(notesBlockDiv);

		// Lines containing
		let queryDiv = contentEl.createEl("div");
		// queryDiv.setAttr("style", "display: inline-grid; width: 100%");

		let taskMenuDiv = contentEl.createEl("div");
		let taskMenuLabel = contentEl.createEl("span", { "text": "Task: "});
		let taskMenu = contentEl.createEl("select");
		taskMenu.setAttr("class", "dropdown");
		taskMenu.multiple;
		taskMenu.setAttr("style", "float: right;");
		let defaultOption = contentEl.createEl("option", { "value": "", "text": ""});
		defaultOption.selected;
		taskMenu.append(defaultOption);
		taskMenu.append(contentEl.createEl("option", { "value": "- ", "text": "- "}));
		taskMenu.append(contentEl.createEl("option", { "value": "- \\[ \\].*", "text": "- [ ] "}));
		taskMenu.append(contentEl.createEl("option", { "value": "- \\[x\\].*", "text": "- [x] "}));
		taskMenu.append(contentEl.createEl("option", { "value": "- \\[.\\].*", "text": "- [x] or - [ ]"}));

		taskMenuDiv.append(taskMenuLabel);
		taskMenuDiv.append(taskMenu);
		queryDiv.append(taskMenuDiv);

		let queryTextDiv = contentEl.createEl("div");
		let queryTextLabel = contentEl.createEl("span", {"text":"Line containing:"});
		let queryInputDiv = contentEl.createEl("div");
		// queryInputDiv.setAttr("style", "float: right, width: 50%");
		let lineQuery = contentEl.createEl("input", {"type": "text"});
		// lineQuery.setAttr("style", "float: right; width: 50%");
		// lineQuery.setAttr("style", "width: 50%;");
		// let requiredAsterisk = contentEl.createEl("span", { "text": "*"});
		// requiredAsterisk.setAttr("style", "float: right;");
		// queryInputDiv.append(lineQuery);
		// queryInputDiv.append(requiredAsterisk);

		queryTextDiv.append(queryTextLabel);
		queryTextDiv.append(lineQuery);

		queryDiv.append(queryTextDiv);

		vantageSettingsDiv.append(queryDiv);

		contentEl.append(vantageSettingsDiv);

		function processDateRange() { 
			let dateRange = "";
			if (startDateInput.value != "") {
				// process dates
			}
			return dateRange;
		}

		function processTags(inputTags) {
			//split by spaces, then return each with tag: appended
			//if no #, add the # too
			let allTags = inputTags.split(" ");
			let processedTags = ""
			for (var eachTag of allTags) {
				if (eachTag.includes("#") {
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
			if ((noteTitleContainsInput.value != "") || (startDateInput.value != "")) {
				searchQuery = searchQuery + "file:(" + noteTitleContainsInput.value + processDateRange() + ") ";
			}
			if (tagInput.value != "") {
				searchQuery = searchQuery + "(" + processTags(tagInput.value) + ") ";
			}
			if (notePathInput.value != "") {
				searchQuery = searchQuery + "path:(" + notePathInput.value + ") ";
			}
			if (noteContainingInput.value != "") {
				searchQuery = searchQuery + "(" + noteContainingInput.value + ") ";
			}
			if (noteSectionInput.value != "") {
				searchQuery = searchQuery + "(" + noteSectionInput.value + ") ";
			}
			if (noteBlockInput.value != "") {
				searchQuery = searchQuery + "(" + noteBlockInput.value + ") ";
			}
			if ((taskMenu.value != "") || (lineQuery.value != "")) {
				if (taskMenu.value != "") {
					searchQuery = searchQuery + "line:(/" + taskMenu.value + lineQuery.value + ".*/) ";
				} else {
					searchQuery = searchQuery + "line:(" + lineQuery.value + ") ";
				}
			}
			return searchQuery;
		}

		let createEmbeddedSearchButton = new ButtonComponent(contentEl)
			.setButtonText("Create embedded search")
			.onClick(() => {
				let embeddedSearchQueryHeader = "```query\n";
				let embeddedSearchQueryFooter = "\n```";
				let embeddedSearchQuery = embeddedSearchQueryHeader + setSearchQuery() + embeddedSearchQueryFooter;
				/**
				 * let vantageTitle = vantageTitleInput.value;
				if ((embeddedSearchQuery === "") && (vantageTitle === "")) {
					lineQuery.setAttr("style", "float: right; width: 50%; border-color: var(--background-modifier-error); border-width: .1em;");
					vantageTitleInput.setAttr("style", "float: right; width: 50%; border-color: var(--background-modifier-error); border-width: .1em;");
				} else if (embeddedSearchQuery === "") {
					lineQuery.setAttr("style", "float: right; width: 50%; border-color: var(--background-modifier-error); border-width: .1em;");
					vantageTitleInput.setAttr("style", "float: right; width: 50%;");
				} else if (vantageTitle === "") {
					lineQuery.setAttr("style", "float: right; width: 50%;");
					vantageTitleInput.setAttr("style", "float: right; width: 50%; border-color: var(--background-modifier-error); border-width: .1em;");
				} else { **/ //code for preventing erroneous input when constructing vantages
					//console.log(vantageTitle + " ⧉");
					
					console.log(embeddedSearchQuery);
					// let searchResults = (vantagePlugin.getSearch(embeddedSearchQuery));
					let doc = this.app.workspace.activeLeaf.view.sourceMode.cmEditor.getDoc();
					let cursor = doc.getCursor();
					doc.replaceRange(embeddedSearchQuery, cursor);
					// get active pane
					// get cursor
					// insert search
					this.close();
				//}
			});

		let initiateSearchButton = new ButtonComponent(contentEl)
			.setButtonText("New search")
			.onClick(() => {
					let searchQuery = setSearchQuery();
					console.log(searchQuery);
					// let searchResults = (vantagePlugin.getSearch(searchQuery));
					vantagePlugin.getSearch(searchQuery);
					this.close();
				// }
			});


	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange((value) => {
					console.log('Secret: ' + value);
				}));

	}
}
