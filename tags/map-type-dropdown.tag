<map-type-dropdown>
	<div id="layer-dropdown">
		<select class="ui selection dropdown compact small">
			<option value="100">100hPa</option>
			<option value="200">200hPa</option>
			<option value="300">300hPa</option>
			<option selected="" value="500">500hPa</option>
			<option value="700">700hPa</option>
			<option value="850">850hPa</option>
			<option value="1000">1000hPa</option>
		</select>
	</div>

	<script>
		// jquery init
		this.on('mount', function() {
			var self = this;
			$('.ui.dropdown').dropdown({
				onChange: function (value){
					window.sounding.changeLevel(value);
				}
			});
		});

		
	</script>

	<style>
		#layer-dropdown {
			position: absolute;
			top: 10px; left: 10px;
			z-index: 100;
			box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
			border-radius:.28571429rem;
		}
	</style>
</map-type-dropdown>

