import { NextRequest, NextResponse } from 'next/server'
import { Document, Paragraph, TextRun, AlignmentType, Packer } from 'docx'

export async function POST(req: NextRequest) {
  try {
    const { content, documentType } = await req.json()

    if (!content) {
      return NextResponse.json({ error: '내용이 없습니다.' }, { status: 400 })
    }

    // 줄바꿈을 기준으로 문단 나누기
    const paragraphs = content.split('\n').map((line: string) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: line || ' ', // 빈 줄은 공백으로
            font: '맑은 고딕',
            size: 24, // 12pt (반 포인트 단위)
          }),
        ],
        spacing: {
          after: 200, // 문단 간격
        },
      })
    })

    // Word 문서 생성
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // 제목
            new Paragraph({
              children: [
                new TextRun({
                  text: documentType || '알림장',
                  font: '맑은 고딕',
                  size: 32, // 16pt
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),
            // 내용
            ...paragraphs,
          ],
        },
      ],
    })

    // DOCX 파일 생성
    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(documentType || '알림장')}_${new Date().toISOString().split('T')[0]}.docx"`,
      },
    })
  } catch (error) {
    console.error('DOCX export error:', error)
    return NextResponse.json({ error: '문서 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
