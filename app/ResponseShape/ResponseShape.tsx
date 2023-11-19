/* eslint-disable react-hooks/rules-of-hooks */
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	Icon,
	TLBaseShape,
	stopEventPropagation,
	toDomPrecision,
	useIsEditing,
	useToasts,
} from '@tldraw/tldraw'

import StackBlitzSDK from '@stackblitz/sdk'
import { useRef } from 'react'

export type ResponseShape = TLBaseShape<
	'response',
	{
		html: string
		w: number
		h: number
	}
>

export class ResponseShapeUtil extends BaseBoxShapeUtil<ResponseShape> {
	static override type = 'response' as const

	getDefaultProps(): ResponseShape['props'] {
		return {
			html: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = () => false
	override canResize = () => true
	override canBind = () => false

	override component(shape: ResponseShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		const iframeRef = useRef<HTMLIFrameElement>(null)
		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{shape.props.html ? (
					<iframe
						ref={iframeRef}
						className="tl-embed"
						srcDoc={shape.props.html}
						width={toDomPrecision(shape.props.w)}
						height={toDomPrecision(shape.props.h)}
						draggable={false}
						style={{
							border: 0,
							pointerEvents: isEditing ? 'auto' : 'none',
							height: '100%',
						}}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						if (navigator && navigator.clipboard) {
							navigator.clipboard.writeText(shape.props.html)
							toast.addToast({
								icon: 'code',
								title: 'Copied to clipboard',
							})
						}
					}}
					onPointerDown={stopEventPropagation}
				>
					<Icon icon="code" />
				</div>
				<div
					title="embed code playground"
					style={{
						position: 'absolute',
						top: 40,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						StackBlitzSDK.embedProject(
							iframeRef.current!,
							{
								files: {
									'index.html': shape.props.html,
									'index.js': '',
								},
								template: 'javascript',
								title: 'tldrawn!',
							},
							{
								openFile: 'index.html',
								hideNavigation: true,
								hideDevTools: true,
								theme: 'light',
								view: 'preview',
							}
						)
						toast.addToast({
							icon: 'external-link',
							title: 'Embedded a code playground',
						})
						setTimeout(() => {
							const newIframe = document.getElementById(shape.id)!.querySelector('iframe')!
							newIframe.height = '100%'
						})
					}}
					onPointerDown={stopEventPropagation}
				>
					<span style={{ rotate: '0.5turn' }}>
						<Icon icon="external-link" />
					</span>
				</div>
				<div
					title="open in code playground"
					style={{
						position: 'absolute',
						top: 80,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						StackBlitzSDK.openProject(
							{
								files: {
									'index.html': shape.props.html,
									'index.js': '',
								},
								template: 'javascript',
								title: 'tldrawn!',
							},
							{
								openFile: 'index.html',
							}
						)
						toast.addToast({
							icon: 'external-link',
							title: 'Opened in code playground',
						})
					}}
					onPointerDown={stopEventPropagation}
				>
					<Icon icon="external-link" />
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: ResponseShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
