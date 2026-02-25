/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "article_attachments")
public class ArticleAttachment extends PanacheEntityBase {

    @Id
    @SequenceGenerator(name = "article_attachment_seq", sequenceName = "article_attachment_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "article_attachment_seq")
    public Long id;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String mimeType;

    @Column(nullable = false, columnDefinition = "bytea")
    public byte[] data;

    @ManyToOne(optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    public Article article;

    public int sizeBytes() {
        return data == null ? 0 : data.length;
    }

    public String sizeLabel() {
        int size = sizeBytes();
        return size == 1 ? "1 byte" : size + " bytes";
    }
}
