let FullCalendarPHPMySQL = (function() {
	"use strict";
	/*********************************************************
	***************************DATA***************************
	*********************************************************/
	let calendar;
	let currentUser;
	let currentSelection; // Temporary info when adding new event
	let selectedEvent;
	
	let colorMap = {};
	const colorEnum = [ // Defines event colors based on activity
		"#44ACED",
		"#ED4458",
		"#19D4CC",
		"#8282B3",
		"#FF6241",
		"#815D25",
		"#E52BC6",
		"#C7CF00",
		"#7A2BE5",
		"#58ED44"
	];
	
	// Exclude non-holidays from the Google Calendar API
	const excludeHolidays = [
		"Trettondagsafton",
		"Alla hjärtans dag",
		"Valborgsmässoafton"
	];
	
	/*********************************************************
	*************************CALENDAR*************************
	*********************************************************/
	function newCalendar() {
		let calendarEl = document.getElementById("calendar");
		calendarEl.innerHTML = "";

		calendar = new FullCalendar.Calendar(calendarEl, {
		  initialView: "timeGridWeek",
		  slotDuration: "00:15",
		  slotMinTime: "07:00", // If changing this, also change initDropdowns
		  slotMaxTime: "18:00", // - when user selects a time
		  weekNumbers: true,
		  weekends: false,
		  allDaySlot: true,
		  nowIndicator: true,
		  height: "auto",
	      firstDay: 1,
		  googleCalendarApiKey: "",
		  customButtons: {
		    copyButton: {
		      text: "Copy",
			  click: displayCopyEvents
			}
		  },
          headerToolbar: {
            start: "prev,next today copyButton",
            center: "title",
            end: "dayGridMonth,timeGridWeek"
          },
	      editable: true,
		  selectable: true,
		  selectMirror: true,
		  unselectCancel: ".modal",
		  selectOverlap: true,
		  displayEventEnd: true,
		  eventTextColor: "#FFF",
	      slotLabelFormat: {
		    hour: "2-digit",
		    minute: "2-digit",
		    hour12: false
	      },
	      eventTimeFormat: {
		    hour: "2-digit",
		    minute: "2-digit",
		    hour12: false
	      },
          eventSources: [
			{
				url: "events/getEvents.php",
				method: "GET",
				extraParams: {
					user: currentUser
				},
				failure: function(e) {
					alert("there was an error while fetching events!");
				}
			},
			{
				googleCalendarId: "sv.swedish#holiday@group.v.calendar.google.com"
			}
		  ],
		  eventContent: function(info) {
			  if (info.event.title !== "")
			      if (!info.event.allDay) {
					  let text;

					  if (info.view.type === "timeGridWeek")
						      text = "<span>" + info.timeText + "</span><br>" + info.event.title +
								"<br><br>" + info.event.extendedProps["tutor"] + "<br>" + info.event.extendedProps["place"];
					  else if (info.view.type === "dayGridMonth")
							  text = "&nbsp;" + info.timeText + " " + info.event.title +
							    "<br><br>&nbsp;" + info.event.extendedProps["tutor"] + "<br>&nbsp;" + info.event.extendedProps["place"];
								
					  return { html: text };
			       }
		  },
		  eventDidMount: function(info) {
			  if (info.event.title !== "") {
			      if (info.event.allDay) {
				      if (excludeHolidays.includes(info.event.title)) {
						  info.el.style.display = "none";
						  return;
					  }

					  // Change column color to red to signal holiday
					  info.el.style.backgroundColor = "#F1B2BD";
					  info.el.style.borderColor = "#F1B2BD";
					  $(".fc-day[data-date='" + info.event.startStr + 
					      "']").css("background", "#F1B2BD"); //#F1B2BD
				  }
				  else {
					  // Assign background color to event
					  let eventColor = colorMap[info.event.title];
					  let usedColors = Object.keys(colorMap).length;
					  
					  if (eventColor === undefined && colorEnum.length > usedColors) {
						  eventColor = colorEnum[usedColors];
						  colorMap[info.event.title] = eventColor;
					  }
				  
					  if (eventColor !== undefined) {
						  info.el.style.backgroundColor = eventColor;
						  info.el.style.borderColor = eventColor;
					  }
					  
					  // Assign text color because eventTextColor doesn't work for month view
					  info.el.style.color = "#FFF";
				  }
			  }
		  },
		  select: function(info) {
			// Don't create a new event when just clicking on a row
			if (info.allDay || (moment(info.start).diff(info.end, "minutes") === -15)) {
				calendar.unselect();
				return;
			}
			
			displayAddEvent(info);
			
			currentSelection = info;
		  },
		  eventClick: function(info) {
			  if (selectedEvent !== undefined) {
				  if (selectedEvent.id === info.event.id) {
					  if (currentUser)
					      displayEditEvent(info.event);
				  }
			  }
			  
			  let sel = document.getElementsByClassName("selected")[0];
			  
			  if (sel !== undefined) {
				  sel.classList.remove("selected");
			  }
			  
			  selectedEvent = info.event;
			  info.el.classList.add("selected");
		  },
		  eventResize: function(info) {
			  let id = info.event.id;
			  let start = info.event.startStr;
		      let end = info.event.endStr;
		
		  	  $.ajax({
			      type: "POST",
				  url: "events/editEvent.php",
				  data: { date: { id: id, start: moment(start).format("YYYY-MM-DD HH:mm:ss"),
								  end: moment(end).format("YYYY-MM-DD HH:mm:ss") } },
				  success: function(result) {
				  }
			  });
			  
			  unselectEvent();
		  },
		  eventDrop: function(info) {
			  let id = info.event.id;
			  let start = info.event.startStr;
		      let end = info.event.endStr;
			  
			  // Copy event if shift key is held down
			  if (info.jsEvent.shiftKey) {
			      $.ajax({
				      type: "POST",
					  url: "events/copyEvent.php",
					  data: { id: id, start: moment(start).format("YYYY-MM-DD HH:mm:ss"),
							  end: moment(end).format("YYYY-MM-DD HH:mm:ss") },
					  success: function(result) {
					      calendar.refetchEvents();
					  }
				  });
			  } else
				  $.ajax({
				      type: "POST",
					  url: "events/editEvent.php",
					  data: { date: { id: id, start: moment(start).format("YYYY-MM-DD HH:mm:ss"),
									  end: moment(end).format("YYYY-MM-DD HH:mm:ss") } },
					  success: function(result) {
					  }
				  });
			  
			  unselectEvent();
		  },
		  unselect: function(jsEvent, view) {
			  unselectEvent();
		  },
		  datesSet: function(view) {
			  unselectEvent();
		  }
		});
		calendar.render();
	}
	/*********************************************************
	*************************CONTROL**************************
	*********************************************************/
	function addEvent() {
		let activity = document.getElementById("addActivity").value;
		let tutor = document.getElementById("addTutor").value;
		let place = document.getElementById("addPlace").value;
		let startTime = document.getElementById("addStart").value;
		let endTime = document.getElementById("addEnd").value;
		let repeat = document.getElementById("repeat").checked;
		let start = currentSelection.start;
		start.setHours(startTime.substring(0, 2));
		start.setMinutes(startTime.substring(3, 5));
		let end = currentSelection.end;
		end.setHours(endTime.substring(0, 2));
		end.setMinutes(endTime.substring(3, 5));

		let events = [];

		// Add repeated events
		if (repeat) {
			let repeatValue = document.querySelector("input[name='repeatTime']:checked").value;

			for (let i = 0; i < repeatValue; i++) {
				let weekStart = moment(start).add(i, "weeks");
				let weekEnd = moment(end).add(i, "weeks");
				
				$.each($("input[name='repeatDay']:checked"), function() {
					let start2 = moment(weekStart).isoWeekday(parseInt($(this).val()));
					let end2 = moment(weekEnd).isoWeekday(parseInt($(this).val()));
					
					events.push({ user: currentUser, activity: activity, tutor: tutor,
					  place: place, start: moment(start2).format("YYYY-MM-DD HH:mm:ss"),
					  end: moment(end2).format("YYYY-MM-DD HH:mm:ss") });
				});
			}
		}
		else events.push({ user: currentUser, activity: activity, tutor: tutor,
		 place: place, start: moment(start).format("YYYY-MM-DD HH:mm:ss"),
		 end: moment(end).format("YYYY-MM-DD HH:mm:ss") });
	
		$.ajax({
			type: "POST",
			url: "events/addEvents.php",
			data: { events: events },
			success: function(result) {
				calendar.refetchEvents();
				calendar.unselect();
		
				document.getElementById("addEventDialog").style.display = "none";
			}
		});
	}
	
	function copyEvents() {
		let fromYear = document.getElementById("copyEventsFromYear").value;
		let fromWeek = document.getElementById("copyEventsFromWeek").value;
		let toYear = document.getElementById("copyEventsToYear").value;
		let toWeek = document.getElementById("copyEventsToWeek").value;
		let fromDate = moment().year(fromYear).isoWeek(fromWeek);
		let toDate = moment().year(toYear).isoWeek(toWeek);
		
		let weekDifference = moment(toDate).diff(fromDate, "weeks");
		let weeks = document.getElementById("copyEventsWeeks").value;
		
		$.ajax({
			type: "GET",
			url: "events/getEvents.php",
			data: { user: currentUser, start: fromDate.startOf("isoweek").format(),
					  end: fromDate.endOf("isoweek").format() },
			success: function(result) {
				if (result.length === 0) {
					document.getElementById("copyEventsDialog").style.display = "none";
					return;
				}

				$.ajax({
					type: "POST",
					url: "events/copyEvents.php",
					data: { events: result, weekStart: weekDifference, weeks: weeks },
					success: function(result) {				
						calendar.refetchEvents();
						unselectEvent();
						
						document.getElementById("copyEventsDialog").style.display = "none";
					}
				});
			}
		});
	}
	
	function editEvent() {
		let activity = document.getElementById("editActivity").value;
		let tutor = document.getElementById("editTutor").value;
		let place = document.getElementById("editPlace").value;
		let startTime = document.getElementById("editStart").value;
		let endTime = document.getElementById("editEnd").value;
		
		let start = selectedEvent.start;
		start.setHours(startTime.substring(0, 2));
		start.setMinutes(startTime.substring(3, 5));
		start = moment(start).format("YYYY-MM-DD HH:mm:ss")
		
		let end = selectedEvent.end;
		end.setHours(endTime.substring(0, 2));
		end.setMinutes(endTime.substring(3, 5));
		end = moment(end).format("YYYY-MM-DD HH:mm:ss")
		
		let event = { id: selectedEvent.id, activity: activity, tutor: tutor,
			place: place, start: start, end: end };
		
		$.ajax({
			type: "POST",
			url: "events/editEvent.php",
			data: { event },
			success: function(result) {
				calendar.refetchEvents();
				unselectEvent();
				
				document.getElementById("editEventDialog").style.display = "none";
			}
		});
	}
	
	function deleteEvent(event) {
		if (event !== undefined) {
			$.ajax({
				type: "POST",
				url: "events/deleteEvent.php",
				data: { id: event.id },
				success: function(result) {
					calendar.refetchEvents();
					unselectEvent();
				}
			});
		}
	}
	
	// Manually unselect event, since FullCalendar's unselect function doesn't work for every element
	function unselectEvent() {
		let sel = document.getElementsByClassName("selected")[0];
		
		if (sel !== undefined)
			document.getElementsByClassName("selected")[0].classList.remove("selected");
		
		selectedEvent = undefined;
	}
	/*********************************************************
	*************************DISPLAY**************************
	*********************************************************/
	function displayAddEvent(info) {
		document.getElementById("addStart").value = moment(info.start).format("HH") +
		  ":" + moment(info.start).format("mm");
		document.getElementById("addEnd").value = moment(info.end).format("HH") + ":" +
		 moment(info.end).format("mm");
		document.getElementById("repeat").checked = false;
		document.getElementById("repeatValueDiv").style.display = "none";
		$.each($("input[name='repeatDay']:checked"), function() {
			$(this).prop("checked", false);
		});
		$("input[name='repeatDay'][value=" + moment(info.start).isoWeekday() + "]").prop("checked", true);
		
		document.getElementById("addEventDialog").style.display = "block";
			
		document.getElementById("addActivity").focus();
	}
	
	function displayCopyEvents() {
		document.getElementById("copyEventsFromWeek").value = moment().isoWeek();
		document.getElementById("copyEventsToWeek").value = moment().add(1, "week").isoWeek();
		document.getElementById("copyEventsFromYear").value = moment().year();
		document.getElementById("copyEventsToYear").value = moment().add(1, "week").year();
		document.getElementById("copyEventsWeeks").value = 12;
		
		document.getElementById("copyEventsDialog").style.display = "block";
	}	
	
	
	function displayEditEvent(event) {
		changeOptionByText(document.getElementById("editActivity"), event.title);
		changeOptionByText(document.getElementById("editTutor"), event.extendedProps["tutor"]);
		changeOptionByText(document.getElementById("editPlace"), event.extendedProps["place"]);
		document.getElementById("editStart").value = moment(event.start).format("HH") +
		  ":" + moment(event.start).format("mm");
		document.getElementById("editEnd").value = moment(event.end).format("HH") +
		  ":" +moment(event.end).format("mm");
					  
		document.getElementById("editEventDialog").style.display = "block";
					  
		document.getElementById("editActivity").focus();
	}
	/*********************************************************
	**************************UTILS***************************
	*********************************************************/
	// Change selected drop-down value based on text
	function changeOptionByText(selectElement, text) {
		let options = selectElement.options;
			
		for (let i = 0; i < options.length; i++)
			if (options[i].innerHTML === text) {
				selectElement.value = options[i].value;
				return;
			}
	}
	/*********************************************************
	**************************INIT****************************
	*********************************************************/
	function initDropdowns() {
		// Populate user calendar drop-down
		$.ajax({
			type: "GET",
			url: "data/getData.php",
			data: { data: "users" },
			success: function(result) {
				$.each(result, function(i, p) {
					if (p.firstName !== "Mall")
						$("#user").append($("<option></option>").val(p.id).html(p.firstName + " " + p.lastName));
				});
				
				// Add "Mall x" to the end
				$.each(result, function(i, p) {
					if (p.firstName === "Mall")
						$("#user").append($("<option></option>").val(p.id).html(p.firstName + " " + p.lastName));
				});
				
				// Current user default to first user in database alphabetically
				currentUser = document.getElementById("user").value;
				// Create a new calendar afterwards to preserve synchronization
				newCalendar();
			}
		});
		
		// Populate tutor calendar drop-down
		$.ajax({
			type: "GET",
			url: "data/getData.php",
			data: { data: "tutors" },
			success: function(result) {
				$.each(result, function(i, p) {
					$("#tutor").append($("<option></option>").val(p.id).html(p.firstName + " " + p.lastName));
				});
			}
		});

		// Populate activities drop-down
		$.ajax({
			type: "GET",
			url: "data/getData.php",
			data: { data: "activities" },
			success: function(result) {
				$.each(result, function(i, p) {
					$("#addActivity").append($("<option></option>").val(p.id).html(p.name));
					$("#editActivity").append($("<option></option>").val(p.id).html(p.name));
				});
			}
		});

		// Populate tutors drop-down
		$.ajax({
			type: "GET",
			url: "data/getData.php",
			data: { data: "tutors" },
			success: function(result) {
				$.each(result, function(i, p) {
					$("#addTutor").append($("<option></option>").val(p.id).html(p.firstName + " " + p.lastName));
					$("#editTutor").append($("<option></option>").val(p.id).html(p.firstName + " " + p.lastName));
				});
			}
		});

		// Populate places drop-down
		$.ajax({
			type: "GET",
			url: "data/getData.php",
			data: { data: "places" },
			success: function(result) {
				$.each(result, function(i, p) {
					$("#addPlace").append($("<option></option>").val(p.id).html(p.name));
					$("#editPlace").append($("<option></option>").val(p.id).html(p.name));
				});
			}
		});
		
		// Populate copy event drop-downs
		for (let i = 1; i <= 53; i++) {
			$("#copyEventsFromWeek").append($("<option></option>").val(i).html(i));
			$("#copyEventsToWeek").append($("<option></option>").val(i).html(i));
		}

		for (let i = moment().year() - 5; i <= moment().year() + 5; i++) {
			$("#copyEventsFromYear").append($("<option></option>").val(i).html(i));
			$("#copyEventsToYear").append($("<option></option>").val(i).html(i));
		}
		
		for (let i = 1; i <= 12; i++) {
			$("#copyEventsWeeks").append($("<option></option>").val(i).html(i));
		}
		
		// Populate start time and end time drop-downs
		let options = [];
		// Hardcoded but should be min and max hour constants
		for (let i = 7; i <= 18; i++) {
			let hour;
			if (i < 10)
				hour = "0" + i;
			else hour = i;
			
			// Every 15 minutes (hardcoded)
			options.push(hour + ":00");
			if (i === 18)
				continue;
			options.push(hour + ":15");
			options.push(hour + ":30");
			options.push(hour + ":45");
		}
		$.each(options, function(i, p) {
			$("#addStart").append($("<option></option>").val(p).html(p));
			$("#addEnd").append($("<option></option>").val(p).html(p));
			$("#editStart").append($("<option></option>").val(p).html(p));
			$("#editEnd").append($("<option></option>").val(p).html(p));
		});		
	}
	
	function initEventListeners() {
		// User drop-down
		document.getElementById("user").onchange = function() {
			let userSelect = document.getElementById("user");
			currentUser = userSelect.value;
			newCalendar();
			
			// If user selects "Mall x", go to the specific week containing the template
			if (userSelect.options[userSelect.selectedIndex].text.includes("Mall ")) {
				calendar.gotoDate("2019-01-07");
				document.getElementsByClassName("fc-toolbar")[0].style.display = "none";
				document.getElementsByClassName("fc-scrollgrid-section")[0].style.display = "none";
			}
			else {
				document.getElementsByClassName("fc-toolbar")[0].style.display = "flex";
				document.getElementsByClassName("fc-scrollgrid-section")[0].style.display = "table-row";
			}
		}
		
		// OK buttons for modals
		document.getElementById("addok").onclick = addEvent;
		document.getElementById("editok").onclick = editEvent;
		document.getElementById("copyEventsok").onclick = copyEvents;
		
		// Repeat box for adding event
		document.getElementById("repeat").onclick = function() {
			let repeatValue = document.getElementById("repeatValueDiv");
			
			if (repeatValue.style.display === "none" || repeatValue.style.display === "")
				repeatValue.style.display = "block";
			else repeatValue.style.display = "none";
		}
		
		// Cancel buttons for modals
		document.getElementById("addCancel").onclick = function() {
			calendar.unselect();
			document.getElementById("addEventDialog").style.display = "none";
		}
		
		document.getElementById("editCancel").onclick = function() {
			unselectEvent();
			document.getElementById("editEventDialog").style.display = "none";
		}
		
		document.getElementById("copyEventsCancel").onclick = function() {
			unselectEvent();
			document.getElementById("copyEventsDialog").style.display = "none";
		}
	}
	
	function initMouseListener() {
		// When the user clicks anywhere outside of a modal, close it
		window.onmousedown = function(event) {
			let addModal = document.getElementById("addEventDialog");
			let editModal = document.getElementById("editEventDialog");
			let copyModal = document.getElementById("copyEventsDialog");
			
			if (event.target === document.body)
				unselectEvent();			
			else if (event.target === addModal) {
				addModal.style.display = "none";
				calendar.unselect();
			}			
			else if (event.target === editModal) {
				editModal.style.display = "none";
				unselectEvent();
			}			
			else if (event.target === copyModal) {
				copyModal.style.display = "none";
				unselectEvent();
			}
		};
	}
	
	function initKeyListener() {
		let addModal = document.getElementById("addEventDialog");
		let editModal = document.getElementById("editEventDialog");
		let copyModal = document.getElementById("copyEventsDialog");
		
		// Delete = Delete selected event
		// Enter = Press OK button on modals
		// Escape = Press Cancel button on modals
		document.addEventListener("keyup", function(event) {
			if (event.key === "Delete") {
				 if (addModal.style.display !== "block" &&
					  editModal.style.display !== "block" &&
					  copyModal.style.display !== "block")
				
				deleteEvent(selectedEvent);
			}
			else if (event.key === "Enter") {
				if (addModal.style.display === "block")
					document.getElementById("addok").click();
				else if (editModal.style.display === "block")
					document.getElementById("editok").click();
				else if (copyModal.style.display === "block")
					document.getElementById("copyEventsok").click();
			}
			else if (event.key === "Escape") {
				if (addModal.style.display === "block")
					document.getElementById("addCancel").click();
				else if (editModal.style.display === "block")
					document.getElementById("editCancel").click();
				else if (copyModal.style.display === "block")
					document.getElementById("copyEventsCancel").click();
			}
		});		
	}
	/*********************************************************
	*********************MAIN FUNCTION************************
	*********************************************************/
	return {
		init: function() {
			initDropdowns();
			initEventListeners();
			initMouseListener();
			initKeyListener();
		}
	};
})();
window.onload = FullCalendarPHPMySQL.init();