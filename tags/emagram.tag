<emagram>
	<div>
		<div id="emagram"></div>
	</div>


	<script>
		this.emagram = null;

		plot (data){
			if (!this.emagram){
				var mobile = $(window).width() < 640;
				var size = (mobile) ? 480 : 600;
				this.emagram = new Emagram("#emagram", size, size);

			}else{
				this.emagram.clear();
			}
			
			this.emagram.plot(data);
		}
	</script>

	<style>
		#emagram svg {
			width: 100%;
		}
	</style>
</emagram>
