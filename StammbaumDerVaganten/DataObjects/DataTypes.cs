using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public enum CertaintyLevel
    {
        None,
        NoIdea,
        EstimationBad,
        EstimationMedium,
        EstimationGood,
        Confident,
        SetInStone
    }

    public class DataParticle
    {
        public CertaintyLevel Certainty;
    }

    //Objects without a history
    public class DataObject : DataParticle
    {
        public static readonly int ID_INVALID = -1;

        protected int id = 0;
        public int ID
        {
            set
            {
                id = value;
                SetNEXTID(Math.Max(id + 1, GetNEXTID()));
            }
            get
            {
                return id;
            }
        }

        protected virtual int GetNEXTID()
        {
            return ID_INVALID;
        }

        protected virtual void SetNEXTID(int id)
        {
            
        }

        protected void ClaimID()
        {
            ID = GetNEXTID();
        }

        public static implicit operator int(DataObject obj)
        {
            return obj.id;
        }

        public DataObject()
        {

        }

        public DataObject(bool claimID)
        {
            if (claimID)
            {
                ClaimID();
            }
        }
    }

    //Plain old data
    public class DataPiece<T> : DataParticle
    {
        protected DateTime timestamp;
        protected List<DataPiece<T>> history = new List<DataPiece<T>>();

        protected T _value;
        public T Value
        {
            set
            {
                timestamp = DateTime.Now;
                DataPiece<T> copy = this;
                history.Add(copy);
                _value = value;
            }
            get
            {
                return _value;
            }
        }

        public DataPiece()
        {
            timestamp = DateTime.Now;
        }

        public DataPiece(T initValue) : this()
        {
            _value = initValue;
        }

        //Bypasses creation of history entry
        //I would love to overwrite the assignment operator so that I don't need this shit but its fucking impossible
        public void Init(T value)
        {
            timestamp = DateTime.Now;
            _value = value;
        }

        public static implicit operator T(DataPiece<T> obj)
        {
            return obj.Value;
        }
    }

    public class Date : DataPiece<DateTime>
    {
        public const int VALUE_INVALID = -1;

        public bool YearDefined = false;
        public bool MonthDefined = false;
        public bool DayDefined = false;

        public int Year
        {
            get { return YearDefined ? Value.Year : 1; }
            set { Value = Value.AddYears(value - Value.Year); YearDefined = true; }
        }

        public int Month
        {
            get { return MonthDefined ? Value.Month : 1; }
            set { Value = Value.AddMonths(value - Value.Month); MonthDefined = true; }
        }

        public int Day
        {
            get { return DayDefined ? Value.Day : 1; }
            set { Value = Value.AddDays(value - Value.Day); DayDefined = true; }
        }

        public void Set(int year = VALUE_INVALID, int month = VALUE_INVALID, int day = VALUE_INVALID)
        {
            if (year != VALUE_INVALID)
            {
                Year = year;
            }
            if (month != VALUE_INVALID)
            {
                Month = month;
            }
            if (day != VALUE_INVALID)
            {
                Day = day;
            }
        }
    }

    public class String : DataPiece<string>
    {
    }
}
