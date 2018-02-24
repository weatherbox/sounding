<map-type-dropdown>
	<div id="layer-dropdown">
		<select class="ui selection dropdown compact small">
			<option each={ v in levels } selected={ v == selected } value={ v }>{ v }hPa</option>
		</select>
	</div>

	<script>
		this.levels = [100, 200, 300, 500, 700, 850, 1000];
		this.selected = location.search.slice(1) || 500;	

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

