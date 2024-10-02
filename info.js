/*
    This file is part of HSR Warp Simulator.
    HSR Warp Simulator is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    HSR Warp Simulator is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
    You should have received a copy of the GNU General Public License along with HSR Warp Simulator. If not, see <https://www.gnu.org/licenses/>.  
*/
// When the user clicks on the button, open the modal
function openInfo() {
    var modal = document.getElementById("info-modal");
    modal["style"].display = "flex";
}

// When the user clicks on <span> (x), close the modal
function closeInfo() {
  var modal = document.getElementById("info-modal");
  modal.style.display = "none";
}

function closeInfoWindow(event) {
    var modal = document.getElementById("info-modal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
} 