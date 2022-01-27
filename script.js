$(document).ready(function() {

	function updateShowcaseTable(){
		$.ajax({
			type: "GET",
			url: 'http://localhost:8080/rest/phones',
			dataType: "json",
			contentType: 'application/json',
			error: function() {
				alert("Connection to server error.");
			},
			success: function(resp) {
				$("tr").remove("#showcaseRow");
				for (i = resp.length - 1; i >= 0; i = i - 1) {
					phone = resp[i];
					$("#showcaseBody").prepend("<tr id='showcaseRow'><td><div class='flex-tCell'><figure><img class='tableImg' src='" + resp[i].image + "'><figcaption><strong>Black</strong></figcaption></figure></div></td><td>" + resp[i].brand + "</td><td>" + resp[i].model + "</td><td>" + resp[i].os + "</td><td>" + resp[i].screensize + "</td></tr>");
				}
				$("#os").val('');
				$("#image").val('');
				$("#brand").val('');
				$("#model").val('');
				$("#screensize").val('');
			}
		});
	}

	$("#submit").click(function() {

		os = $("#os").val();
		image = $("#image").val();
		brand = $("#brand").val();
		model = $("#model").val();
		screensize = $("#screensize").val();

		if( os == "" || image == "" || brand == "" || model == "" || screensize == "") {
			alert("All input fields are required");
		} else {
			obj = {
				brand: brand,
				model: model,
				os: os,
				image: image,
				screensize: screensize
			}
			$.ajax({
				type: "POST",
				url: 'http://localhost:8080/rest/post',
				dataType: "json",
				contentType: 'application/json',
				data: JSON.stringify(obj),
				error: function() {
					alert("Connection to server error.");
				},
				success: function(resp) {
					updateShowcaseTable();
				}
			});
		}

	});

	// $("#resetShowcaseTable").click(function() {
	// 	$.ajax({
	// 		type: "GET",
	// 		url: 'https://wt.ops.labs.vu.nl/api22/acc840b2/reset',
	// 		dataType: "json",
	// 		contentType: 'application/json',
	// 		error: function() {
	// 			alert("Connection to server error.");
	// 		},
	// 		success: function(resp) {
	// 			updateShowcaseTable();
	// 		}
	// 	});
	// });

	$("#modelHeader").click(function() {
		sortShowcase("showcase", 2, "asc", false);
	});

	$("#screensizeHeader").click(function() {
		sortShowcase("showcase", 4, "desc", true);
	});

	$("#scrollableCaption").click(function() {
		sortScrollable("scrollable", "asc");
	});


	// This function was taken from https://www.w3schools.com/howto/howto_js_sort_table.asp and personally tweaked to work for numbers (screensize) as well
	function sortShowcase(id, col, dir, isNumber) {
		var table, rows, switching, i, x, y, shouldSwitch, switchcount = 0;
		table = document.getElementById(id);
		switching = true;

		while(switching) {
			switching = false;
			rows = table.rows;

			for(i = 1; i < (rows.length - 2); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("td")[col].innerHTML;
				y = rows[i + 1].getElementsByTagName("td")[col].innerHTML;

				if(isNumber == true) {
					x = parseInt(x);
					y = parseInt(y);
				}

				if(dir == "asc") {
					if(isNumber == true) {
						if (x > y) {
							// If so, mark as a switch and break the loop:
							shouldSwitch = true;
							break;
						}
					} else {
						if (x.toLowerCase() > y.toLowerCase()) {
							// If so, mark as a switch and break the loop:
							shouldSwitch = true;
							break;
						}
					}
				}
				if(dir == "desc") {
					if(isNumber == true) {
						if (x < y) {
							// If so, mark as a switch and break the loop:
							shouldSwitch = true;
							break;
						}
					} else {
						if (x.toLowerCase() < y.toLowerCase()) {
							// If so, mark as a switch and break the loop:
							shouldSwitch = true;
							break;
						}
					}
				}
			}
			if (shouldSwitch) {
				/* If a switch has been marked, make the switch
				and mark that a switch has been done: */
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
				// Each time a switch is done, increase this count by 1:
				switchcount ++;
			} else {
				/* If no switching has been done AND the direction is "asc",
				set the direction to "desc" and run the while loop again. */
				if (switchcount == 0 && dir == "asc") {
					dir = "desc";
					switching = true;
				}
			}
		}
	}

	//Algorithm inspired from function above, accesing of DOM elements done personally
	function sortScrollable(id, dir) {
		var table, row, cells, cell, switching, i, x, y, shouldSwitch, switchcount = 0;
		table = document.getElementById(id);
		row = table.rows[0];
		switching = true;

		while(switching) {
			switching = false;
			cells = row.cells;

			for(i = 1; i < cells.length - 2; i++) {
				shouldSwitch = false;

				cell = cells[i];
				nextCell = cells[i + 1];
				textCell = cell.children[0].children[1].querySelector("#price").innerHTML;
				textNextCell = nextCell.children[0].children[1].querySelector("#price").innerHTML;
				priceCell = parseInt(textCell.split(" ")[2]);
				priceNextCell = parseInt(textNextCell.split(" ")[2]);

				if(dir == "asc") {
					if (priceCell > priceNextCell) {
						// If so, mark as a switch and break the loop:
						shouldSwitch = true;
						break;
					}
				}
				if(dir == "desc") {
					if (priceCell < priceNextCell) {
						// If so, mark as a switch and break the loop:
						shouldSwitch = true;
						break;
					}
				}
			}

			if (shouldSwitch) {
				/* If a switch has been marked, make the switch
				and mark that a switch has been done: */
				cells[i].parentNode.insertBefore(cells[i + 1], cells[i]);
				switching = true;
				// Each time a switch is done, increase this count by 1:
				switchcount ++;
			} else {
				/* If no switching has been done AND the direction is "asc",
				set the direction to "desc" and run the while loop again. */
				if (switchcount == 0 && dir == "asc") {
					dir = "desc";
					switching = true;
				}
			}
		}
	}

	updateShowcaseTable();
});
