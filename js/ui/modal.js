jui.defineUI("ui.modal", [ "jquery", "util.base" ], function($, _) {
	
	/**
	 * Common Logic
	 * 
	 */
	var win_width = 0;
	
	_.resize(function() {
		if(win_width == $(window).width()) return; 
		
		var call_list = jui.get("ui.modal");
		for(var i = 0; i < call_list.length; i++) {
			var ui_list = call_list[i];
			
			for(var j = 0; j < ui_list.length; j++) {
				if(ui_list[j].type == "show") {
					ui_list[j].resize();
				}
			}
		}
		
		win_width = $(window).width();
	}, 300);

    /**
     * @class ui.modal
     * implements modal window
     * @extends core
     * @alias Modal
     * @requires jquery
     * @requires util.base
     *
     */
	var UI = function() {
		var $modal = null, $clone = null;
		var uiObj = null, uiTarget = null;
		var x = 0, y = 0, z_index = 5000;
		
		
		/**
		 * Private Methods
		 * 
		 */
		function setPrevStatus(self) {
			uiObj = { 
				"position": $(self.root).css("position"),
				"left": $(self.root).css("left"),
				"top": $(self.root).css("top"),
				"z-index": $(self.root).css("z-index"),
				"display": $(self.root).css("display")
			};
			
			uiTarget = {
				"position": $(self.options.target).css("position")
			};
		}
		
		function getModalInfo(self) {
			var target = self.options.target,
				hTarget = (target == "body") ? window : target,
				pos = (target == "body") ? "fixed" : "absolute",
				tPos = (target == "body") ? null : "relative",
                sLeft = $(target).scrollLeft();
			
			var x = (($(hTarget).width() / 2) - ($(self.root).width() / 2)) + $(target).scrollLeft(),
				y = ($(hTarget).height() / 2) - ($(self.root).height() / 2);

			var w = (sLeft > 0) ? $(target).outerWidth() + sLeft : "100%",
				h = $(target).outerHeight();

			// inner modal일 경우
			if(tPos != null) {
				var sh = $(hTarget)[0].scrollHeight;
				
				h = (sh > h) ? sh : h;
				y = y + $(hTarget).scrollTop();

			// global modal일 경우
			} else {
				var sh = $(window).outerHeight();

				h = (h > sh) ? h : sh;
			}
			
			return {
				x: x, y: y, pos: pos, tPos: tPos, w: w, h: h
			}
		}
		
		function createModal(self, w, h) {
			if($modal != null) return;
			
			$modal = $("<div id='MODAL_" + self.timestamp + "'></div>").css({ 
				position: "absolute",
				width: w,
				height: h,
				left: 0,
				top: 0,
				opacity: self.options.opacity, 
				"background-color": self.options.color,
				"z-index": (z_index + self.options.index) - 1
			});
		
			// 모달 추가
			$(self.options.target).append($modal);
			
			// 루트 모달 옆으로 이동
			if(self.options.target != "body") {
				$(self.root).insertAfter($modal);
			}
			
			// 모달 닫기 이벤트 걸기
			self.addEvent($modal, "click", function(e) {
				if(self.options.autoHide) {
					self.hide();
				}
				
				return false;
			});
		}
		
		
		/**
		 * Public Methods
		 * 
		 */
		
		this.init = function() {
			setPrevStatus(this); // 이전 상태 저장

			// 대상의 기본 상태는 숨기기
			if(!this.options.clone) {
				$(this.root).hide();
			}

			// 타입 프로퍼티 설정
			this.type = "hide";
		}
		
		this.hide = function() {
			var opts = this.options;

			// 모달 대상 객체가 숨겨진 상태가 아닐 경우..
			if(opts.clone) {
				$clone.remove();
				$clone = null;
			}
			
			$(opts.target).css("position", uiTarget.position);
			$(this.root).css(uiObj);
			
			if($modal) {
				$modal.remove();
				$modal = null;
			}
			
			this.type = "hide";
		}
		
		this.show = function() {
			var opts = this.options,
				info = getModalInfo(this);

			// 모달 대상 객체가 숨겨진 상태가 아닐 경우..
			if(opts.clone) {
				$clone = $(this.root).clone();
				$clone.insertAfter($(this.root));
			}

            // 위치 재조정
            this.resize();

			$(opts.target).css("position", info.tPos);
			$(this.root).show();

			createModal(this, info.w, info.h);
			this.type = "show";
		}

        this.resize = function() {
            var info = getModalInfo(this);

            $(this.root).css({
                "position": info.pos,
                "left": info.x,
                "top": info.y,
                "z-index": (z_index + this.options.index)
            });

            if($modal != null) {
                $modal.height(info.h);
            }
        }
	}

    UI.setup = function() {
        return {
			color: "black",
			opacity: 0.4,
			target: "body",
			index: 0,
			clone: false,
			autoHide: true // 자신을 클릭했을 경우, hide
        }
    }
	
	return UI;
});