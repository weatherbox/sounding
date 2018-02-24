<emagram>
	<div>
		<div id="emagram"></div>
	</div>


	<script>
		this.emagram = null;

		plot (data){
			console.log(data);
			if (!this.emagram){
				this.emagram = new Emagram("#emagram", 480, 480);
			}else{
				this.emagram.clear();
			}
			
			this.emagram.plot(data);
		}
	</script>
</emagram>
