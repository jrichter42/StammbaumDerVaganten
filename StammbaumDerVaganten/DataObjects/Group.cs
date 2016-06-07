using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public enum GroupType_Type
    {
        None,
        Stamm,
        Meute,
        Rudel,
        Gilde,
        Sippe,
        Runde,
        Kreis
    }

    public class GroupType : DataPiece<GroupType_Type>
    {

    }

    public class Group : DataObject
    {
        public GroupType type = new GroupType();
        public String name = new String();
        public Group ParentGroup = null;
        public List<Group> SubGroups = new List<Group>();

        public String comment = new String();

        public GroupType_Type Type
        {
            get { return type.Value; }
            set { type.Value = value; }
        }

        public string Name
        {
            get { return name.Value; }
            set { name.Value = value; }
        }

        public string Comment
        {
            get { return comment.Value; }
            set { comment.Value = value; }
        }

        public Group()
        {
            type.Init(GroupType_Type.None);
        }
    }
}
