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
        public GroupType Type = new GroupType();
        public String Name = new String();
        public Group ParentGroup = null;
        public List<Group> SubGroups = new List<Group>();

        public String Comment = new String();

        public Group()
        {
            Type.Init(GroupType_Type.None);
        }
    }
}
